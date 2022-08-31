import CSS from "csstype"
import { ethers } from "ethers"
import React, { useState } from "react"
import { startPoll, castVote, endPoll, discoverVotes } from "../utils/utilsFunctions"
import ReactModal from "react-modal"
// @ts-ignore
import back from "../images/back.png"
import { Link } from "react-router-dom"

function Vote(props) {
  const contract: ethers.Contract = props.contract
  const signer: ethers.providers.JsonRpcSigner = props.signer

  const [inputPollId, setInputPollId] = useState("")
  const [contractFound, setContractFound] = useState(false)
  const [contractState, setContractState] = useState("")
  const [candidates, setCandidates] = useState<String[]>([])
  const [coordinator, setCoordinator] = useState("")
  const [isCoordinator, setIsCoordinator] = useState<Boolean>(false)
  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false)
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [votes, setVotes] = useState<Number[]>([])

  const handlePollIdChange = (e) => {
    setInputPollId(e.target.value)
  }

  const getContractInfo = async () => {
    setContractFound(false)

    try {
      let cands: string[] = await contract.getCandidates(BigInt(inputPollId))
      if (cands.length === 0) {
        console.log("Empty Candidates Array")
        return
      }
      setCandidates(cands)

      let state: number = await contract.getPollState(BigInt(inputPollId))
      switch (state) {
        case 0: {
          setContractState("Created")
          break
        }
        case 1: {
          setContractState("Ongoing")
          break
        }
        case 2: {
          setContractState("Ended")
          break
        }
      }

      const contract_coordinator: string = await contract.getCoordinator(BigInt(inputPollId))
      const address = await signer.getAddress()
      const isCoord: Boolean = contract_coordinator.toLowerCase() === address.toLowerCase()
      setIsCoordinator(isCoord)
      setCoordinator(contract_coordinator.toLowerCase())

      setContractFound(true)
    } catch (err) {
      throw Object.assign(new Error(err))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    await getContractInfo().catch((err) => {
      console.log(err)
    })
  }

  const handleStartPoll = async () => {
    await startPoll(contract, BigInt(inputPollId))
  }

  const handleVote = async (vote) => {
    const address = await signer.getAddress()
    await castVote(contract, BigInt(inputPollId), selectedIndex, address.toLowerCase(), coordinator).catch((err) => {
      console.log(err)
    })

    setIsVoteModalOpen(false)
  }

  const handleEndPoll = async () => {
    await endPoll(contract, BigInt(inputPollId))
  }

  const handleResults = async () => {
    const votes = await discoverVotes(contract, BigInt(inputPollId), coordinator, candidates.length)

    setVotes(votes)
    const max = Math.max(...votes)
    setSelectedIndex(votes.indexOf(max))
    setIsResultsModalOpen(true)
  }

  return (
    <>
      <div style={{ display: "flex", flexFlow: "row", justifyContent: "center" }}>
        <div>
          <h1 style={headerStyle}>Vote on an on going poll</h1>
          <form
            style={{ display: "flex", flexFlow: "column", alignItems: "center", justifyContent: "center" }}
            onSubmit={handleSubmit}
          >
            <label>
              Poll Id:
              <input
                type="text"
                value={inputPollId}
                onChange={handlePollIdChange}
                style={{ marginLeft: 18, marginBottom: 20, width: 350 }}
              />
            </label>
            <input className="button-3" type="submit" value="Search" />
          </form>

          {contractFound && (
            <div>
              <div
                style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", marginTop: 20, marginLeft: 40 }}
              >
                <div style={{ display: "flex", flexFlow: "column", alignItems: "center" }}>
                  <div>State</div>
                  <div>{contractState}</div>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexFlow: "column",
                    justifyContent: "center",
                    marginLeft: 40,
                    width: 350
                  }}
                >
                  <div style={{ alignSelf: "center" }}>Candidates</div>
                  {candidates.map((candidate, index) => (
                    <div key={index}>{candidate}</div>
                  ))}
                </div>
                <div
                  style={{
                    display: "flex",
                    flexFlow: "column",
                    alignItems: "center",
                    marginLeft: 40
                  }}
                >
                  <div style={{}}>isCoordinator</div>
                  <div>{isCoordinator.toString()}</div>
                </div>
              </div>
              <div style={container}>
                <button
                  className="button-3"
                  style={{}}
                  disabled={contractState === "Ongoing" || !isCoordinator}
                  onClick={handleStartPoll}
                >
                  Start Poll
                </button>
                <button
                  className="button-3"
                  style={{ marginLeft: 30 }}
                  disabled={contractState !== "Ongoing" || !isCoordinator}
                  onClick={handleEndPoll}
                >
                  End Poll
                </button>
                <button
                  className="button-3"
                  style={{ marginLeft: 30 }}
                  disabled={contractState !== "Ongoing"}
                  onClick={() => {
                    setIsVoteModalOpen(true)
                  }}
                >
                  Vote
                </button>
                <button
                  className="button-3"
                  style={{ marginLeft: 30 }}
                  disabled={contractState !== "Ended"}
                  onClick={handleResults}
                >
                  Results
                </button>
              </div>
            </div>
          )}
          <ReactModal
            isOpen={isVoteModalOpen}
            ariaHideApp={false}
            style={{
              content: {
                display: "flex",
                flexFlow: "column",
                alignItems: "center",
                backgroundColor: "#37367b",
                top: 200,
                bottom: 200,
                left: 300,
                right: 300
              }
            }}
          >
            <h3>Who do you want to vote?</h3>
            <div
              style={{
                display: "flex",
                flexFlow: "column"
              }}
            >
              {candidates.map((candidate, index) => (
                <button
                  key={index}
                  style={{
                    color: selectedIndex === index ? "green" : "black",
                    borderRadius: 20,
                    marginBottom: 10,
                    width: 350,
                    cursor: "pointer"
                  }}
                  onClick={() => {
                    setSelectedIndex(index)
                  }}
                >
                  {candidate}
                </button>
              ))}
            </div>
            <div style={{ position: "absolute", bottom: 30 }}>
              <button className="button-3" style={{ background: "red" }} onClick={() => setIsVoteModalOpen(false)}>
                Cancel
              </button>
              <button className="button-3" style={{ marginLeft: 50 }} onClick={handleVote}>
                Vote
              </button>
            </div>
          </ReactModal>
          <ReactModal
            isOpen={isResultsModalOpen}
            ariaHideApp={false}
            style={{
              content: {
                display: "flex",
                flexFlow: "column",
                alignItems: "center",
                backgroundColor: "#37367b",
                top: 200,
                bottom: 200,
                left: 300,
                right: 300
              }
            }}
          >
            <h3>Poll Results</h3>
            <div
              style={{
                display: "flex",
                flexFlow: "column"
              }}
            >
              {candidates.map((candidate, index) => (
                <div style={{ display: "flex", flexFlow: "row", justifyContent: "center" }}>
                  <button
                    key={index}
                    style={{
                      color: selectedIndex === index ? "green" : "black",
                      borderRadius: 20,
                      marginBottom: 10,
                      width: 350
                    }}
                  >
                    {candidate}
                  </button>
                  <div style={{ marginLeft: 5 }}> : {votes[index]}</div>
                </div>
              ))}
            </div>
            <div style={{ position: "absolute", bottom: 30 }}>
              <button className="button-3" style={{ background: "red" }} onClick={() => setIsResultsModalOpen(false)}>
                Close
              </button>
            </div>
          </ReactModal>
        </div>
        <div style={{ display: "flex", marginLeft: 60, marginTop: 30 }}>
          <Link style={horizontalComponent} to="/">
            <button className="button-3">
              <img
                src={back}
                alt="logo"
                style={{
                  //height: null,
                  width: "15px",
                  marginTop: 3
                }}
              />
            </button>
          </Link>
        </div>
      </div>
    </>
  )
}

const headerStyle: CSS.Properties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
}

const container: CSS.Properties = {
  marginTop: "20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
}

const horizontalComponent: CSS.Properties = {
  float: "left"
}

export default Vote
