// @ts-nocheck
import CSS from "csstype"
import { ethers } from "ethers"
import { Link } from "react-router-dom"
import React, { useState } from "react"
// @ts-ignore
import { createPoll_test } from "../utils/utilsFunctions.ts"

import back from "../images/back.png"

interface id_comm_obj {
  identity: ZkIdentity
  commitment: bigint
}

const rnd256 = () => {
  const bytes = new Uint8Array(32)

  // load cryptographically random bytes into array
  window.crypto.getRandomValues(bytes)

  // convert byte array to hexademical representation
  const bytesHex = bytes.reduce((o, v) => o + ("00" + v.toString(16)).slice(-2), "")

  // convert hexademical value to a decimal string
  return BigInt("0x" + bytesHex).toString(10)
}

function CreatePoll(props) {
  const contract: ethers.Contract = props.contract

  const [coordinatorInput, setInputCoordinator] = useState("")
  const [candidatesInput, setInputCandidates] = useState("")
  const [pollId, setPollId] = useState<BigInt>(0)
  const [pollCreated, setPollCreated] = useState(false)

  const handleCoordinatorChange = (e) => {
    setInputCoordinator(e.target.value)
  }

  const handleCandidatesChange = (e) => {
    setInputCandidates(e.target.value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    let coordinator = coordinatorInput.replace(/\s/g, "")
    let candidates: string[] = candidatesInput.replace(/\s/g, "").split(",")

    //console.log("coordinator:" + coordinator)
    //console.log("candidates:" + candidates)

    const check_value = BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617")
    let newPollId: bigInt = rnd256()
    while (newPollId >= check_value) {
      newPollId = rnd256()
    }

    console.log("pollId=" + newPollId)
    setPollId(newPollId)

    let identities: id_comm_obj[] = []

    try {
      identities = await createPoll_test(contract, newPollId, coordinator, candidates)
      console.log(identities)
      setPollCreated(true)
    } catch (err) {
      console.log(err)
      setPollCreated(false)
    }
  }

  return (
    <>
      <div style={{ display: "flex", flexFlow: "row", justifyContent: "center" }}>
        <div>
          <h1 style={headerStyle}>Create a new poll</h1>
          <form
            style={{ display: "flex", flexFlow: "column", alignItems: "center", justifyContent: "center" }}
            onSubmit={handleSubmit}
          >
            <label>
              Coordinator Address:
              <input
                type="text"
                value={coordinatorInput}
                onChange={handleCoordinatorChange}
                style={{
                  marginLeft: 18,
                  marginBottom: 20,
                  width: 350,
                  borderRadius: 4,
                  borderWidth: 0,
                  outline: "none"
                }}
              />
            </label>
            <label>
              Candidates Addresses:
              <input
                type="text"
                value={candidatesInput}
                onChange={handleCandidatesChange}
                style={{
                  marginLeft: 10,
                  marginBottom: 20,
                  width: 350,
                  borderRadius: 4,
                  borderWidth: 0,
                  outline: "none"
                }}
              />
            </label>
            <input className="button-3" type="submit" value="Submit" />
            {pollCreated && <h4 style={headerStyle}>New poll created with id: {pollId}</h4>}
          </form>
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

export default CreatePoll
