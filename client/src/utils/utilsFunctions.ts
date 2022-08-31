import { Strategy, ZkIdentity } from "@zk-kit/identity"
import { SemaphoreSolidityProof } from "@zk-kit/protocols"
import { Bytes, ethers, utils } from "ethers"
import fetch from "node-fetch"
import { accounts } from "./accounts"

interface id_comm_obj {
  identity: ZkIdentity
  commitment: bigint
}

const discoverPollStart = async (contract: ethers.Contract, pollId: bigint, coordinatorAddress: string) => {
  const filter = contract.filters.PollStarted(null, coordinatorAddress)
  const events = await contract.queryFilter(filter)
  const encryptionKey = events[0].args[2]

  return encryptionKey
}

const discoverPollEnd = async (contract: ethers.Contract, pollId: bigint, coordinatorAddress: string) => {
  const filter = contract.filters.PollEnded(null, coordinatorAddress)
  const events = await contract.queryFilter(filter)
  const decryptionKey = events[0].args[2]

  return decryptionKey
}

export const discoverVotes = async (
  contract: ethers.Contract,
  pollId: bigint,
  coordinatorAddress: string,
  totalCandidates: number
) => {
  const result = contract.filters.VoteAdded(pollId)
  const events = await contract.queryFilter(result)

  const votes: number[] = []
  for (let i = 0; i < totalCandidates; i++) {
    votes.push(0)
  }
  const decryptionKey = await discoverPollEnd(contract, pollId, coordinatorAddress)

  const decryptMessage = async (message, decryptionKey) => {
    return fetch(
      "http://localhost:8001/decryptmessage?" +
        new URLSearchParams({
          key: decryptionKey,
          msg: message
        })
    )
      .then((response) => {
        return response.json()
      })
      .then((myJson) => {
        return myJson
      })
      .catch(() => {
        console.log("Error in decryptmessage")
      })
  }

  events.forEach(async (ev) => {
    const vote = ev.args[1]
    const encryptedMsg = utils.parseBytes32String(vote)
    //const response = await decryptMessage(encryptedMsg, decryptionKey)
    //console.log(response.msg)
    //const voteToNumber = Number(response.msg)
    const voteToNumber = Number(encryptedMsg)
    votes[voteToNumber] = votes[voteToNumber] + 1
  })

  //console.log(decryptionKey)
  //console.log("Votes = " + votes)

  return votes
}

// Implement createPoll() function.
export const createPoll = async (
  contract: ethers.Contract,
  pollId: bigint,
  coordinatorAddress: string,
  candidateAddresses: string[]
) => {
  //const pollId = rnd256()

  await contract.createPoll(pollId, coordinatorAddress, BigInt(20), candidateAddresses, {
    gasPrice: utils.parseUnits("1", "gwei"),
    gasLimit: 30000000
  })

  return pollId
}

// Implement createPoll() function. TEST FUNCTION
export const createPoll_test = async (
  contract: ethers.Contract,
  pollId: bigint,
  coordinatorAddress: string,
  candidateAddresses: string[]
) => {
  console.log(contract)
  const tx = await contract
    .createPoll(pollId, coordinatorAddress, 20, candidateAddresses, {
      gasPrice: utils.parseUnits("1", "gwei"),
      gasLimit: 30000000
    })
    .catch((err) => {
      throw Object.assign(new Error("Error with poll creation" + err))
    })

  console.log(tx)
  const getAllIdentities = async () => {
    return fetch(
      "http://localhost:8001/test_getallidentities?" +
        new URLSearchParams({
          pollId: pollId.toString()
        })
    )
      .then((response) => {
        return response.json()
      })
      .then((myJson) => {
        return myJson
      })
      .catch(() => {
        console.log("Error in test_getallidentities")
      })
  }

  let identities: id_comm_obj[] = await getAllIdentities()

  // Add only the first 3 accs
  for (let i = 0; i < 3; i++) {
    await addVoter(contract, pollId, identities[i].commitment)
  }

  return identities
}

// Implement addVoter() function.
export const addVoter = async (contract, pollId: bigint, commitment: bigint) => {
  await contract.addVoter(pollId, commitment, {
    gasPrice: utils.parseUnits("1", "gwei"),
    gasLimit: 30000000
  })
}

// Implement startPoll() function.
export const startPoll = async (contract, pollId: bigint) => {
  const getEncryptionKey = async () => {
    return fetch(
      "http://localhost:8001/getkeypair?" +
        new URLSearchParams({
          pollId: pollId.toString()
        })
    )
      .then((response) => {
        return response.json()
      })
      .then((myJson) => {
        return myJson
      })
      .catch((err) => {
        throw Object.assign(new Error(err))
      })
  }

  const res = await getEncryptionKey().catch((err) => {
    throw Object.assign(new Error(err))
  })
  const encryptionKey = res.key

  await contract.startPoll(pollId, encryptionKey, {
    gasPrice: utils.parseUnits("1", "gwei"),
    gasLimit: 30000000
  })
}
// Implement castVote() function.
export const castVote = async (contract, pollId: bigint, vote: number, address: string, coordinatorAddress: string) => {
  const acc_index = accounts.indexOf(address)

  const encryptionKey = await discoverPollStart(contract, pollId, coordinatorAddress)

  const getProof = async () => {
    return fetch(
      "http://localhost:8001/test_getproof?" +
        new URLSearchParams({
          pollId: pollId.toString(),
          index: acc_index.toString(),
          vote: vote.toString(),
          encryptionKey: encryptionKey
        })
    )
      .then((response) => {
        return response.json()
      })
      .then((myJson) => {
        return myJson
      })
      .catch((err) => {
        throw Object.assign(new Error(err))
      })
  }

  const argument = await getProof().catch((err) => {
    throw Object.assign(new Error(err))
  })

  const bytes32Vote: string = argument.vote
  const nullifier = argument.nullifier
  const solidityProof: SemaphoreSolidityProof = argument.proof

  await contract.castVote(bytes32Vote, nullifier, pollId, solidityProof, {
    gasPrice: utils.parseUnits("1", "gwei"),
    gasLimit: 30000000
  })
}

// Implement endPoll() function.
export const endPoll = async (contract, pollId: bigint) => {
  const getDecryptionKey = async () => {
    return fetch(
      "http://localhost:8001/getdecryptionkey?" +
        new URLSearchParams({
          pollId: pollId.toString()
        })
    )
      .then((response) => {
        return response.json()
      })
      .then((myJson) => {
        return myJson
      })
      .catch((err) => {
        throw Object.assign(new Error(err))
      })
  }

  const res = await getDecryptionKey().catch((err) => {
    throw Object.assign(new Error(err))
  })
  const decryptionKey = res.key

  await contract.endPoll(pollId, decryptionKey, {
    gasPrice: utils.parseUnits("1", "gwei"),
    gasLimit: 30000000
  })
}

// Get random bigint
export function rnd256() {
  const bytes = new Uint8Array(32)

  // load cryptographically random bytes into array
  window.crypto.getRandomValues(bytes)

  // convert byte array to hexademical representation
  const bytesHex = bytes.reduce((o, v) => o + ("00" + v.toString(16)).slice(-2), "")

  // convert hexademical value to a decimal string
  return BigInt("0x" + bytesHex).toString(10)
}
