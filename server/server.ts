import express, { Request, Response, NextFunction } from "express"
import { Strategy, ZkIdentity } from "@zk-kit/identity"
import {
  Semaphore,
  SemaphorePublicSignals,
  SemaphoreSolidityProof,
  generateMerkleProof,
  StrBigInt
} from "@zk-kit/protocols"
import { privateKeys } from "../client/src/utils/privateKeys"
import * as fs from "fs"
import { utils } from "ethers"
import * as crypto from "crypto"

const cors = require("cors")
const corsOptions = {
  origin: "*",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200
}

const app = express()
const port = 8001
app.use(cors(corsOptions))

BigInt.prototype["toJSON"] = function () {
  return this.toString()
}

const wasmFilePath = "./snark/semaphore.wasm"
const finalZkeyPath = "./snark/semaphore_final.zkey"

interface PollIdentities {
  pollId: string
  publicKey: string
  privateKey: string
  identities: string[]
}

interface id_comm_obj {
  identity: ZkIdentity
  commitment: bigint
}

const getAllIdentities = (request: Request, response: Response, next: NextFunction) => {
  const id: string = request.query.pollId as string
  const pollId = BigInt(id)

  const identities: id_comm_obj[] = []

  privateKeys.forEach((pk: string) => {
    const identity = new ZkIdentity(Strategy.MESSAGE, pk)
    const comm = identity.genIdentityCommitment()
    identities.push({ identity: identity, commitment: comm })
  })

  const serializedIDs: string[] = []
  identities.forEach((id) => {
    serializedIDs.push(id.identity.serializeIdentity())
  })

  const poll: PollIdentities = { pollId: pollId.toString(), publicKey: "", privateKey: "", identities: serializedIDs }

  if (!fs.existsSync("./data.json")) {
    let polls: PollIdentities[] = []
    polls.push(poll)
    fs.writeFileSync("./data.json", JSON.stringify(polls, null, 0), "utf-8")
  } else {
    const res = fs.readFileSync("./data.json", { encoding: "utf-8" })
    let polls: PollIdentities[] = JSON.parse(res)
    polls.push(poll)
    fs.writeFileSync("./data.json", JSON.stringify(polls, null, 0), "utf-8")
  }

  response.status(200).json(identities)
}

const getProof = async (request: Request, response: Response, next: NextFunction) => {
  const id: string = request.query.pollId as string
  const i: string = request.query.index as string
  const vote: string = request.query.vote as string
  const encryptionKey: string = request.query.encryptionKey as string
  const pollId = BigInt(id)
  const index = Number(i)

  if (!fs.existsSync("./data.json")) return

  const res = fs.readFileSync("./data.json", { encoding: "utf-8" })
  let polls: PollIdentities[] = JSON.parse(res)

  let identities: id_comm_obj[] = []
  polls.every((poll) => {
    if (pollId === BigInt(poll.pollId)) {
      poll.identities.forEach((id) => {
        const identity: ZkIdentity = new ZkIdentity(Strategy.SERIALIZED, id)
        const comm = identity.genIdentityCommitment()
        identities.push({ identity: identity, commitment: comm })
      })
      return false
    }
    return true
  })

  let index_comm: bigint
  let index_id: ZkIdentity
  let comms: bigint[] = []

  // Add only the first 3 accs
  for (let i = 0; i < 3; i++) {
    if (i === index) {
      index_id = identities[i].identity
      index_comm = identities[i].commitment
    }
    comms.push(identities[i].commitment)
  }

  //console.log(encryptionKey)

  const merkleProof = generateMerkleProof(20, BigInt(0), comms, index_comm)

  //const bytes32Vote = utils.formatBytes32String(vote)
  //const encryptedBuffer = crypto.publicEncrypt(encryptionKey, Buffer.from(bytes32Vote))
  //console.log(encryptedBuffer.length)

  const bytes32Vote = utils.formatBytes32String(vote)
  console.log(bytes32Vote)

  const witness = Semaphore.genWitness(index_id.getTrapdoor(), index_id.getNullifier(), merkleProof, pollId, vote)
  const fullProof = await Semaphore.genProof(witness, wasmFilePath, finalZkeyPath)

  let publicSignals = fullProof.publicSignals
  let solidityProof = Semaphore.packToSolidityProof(fullProof.proof)

  const argument = { vote: bytes32Vote, nullifier: publicSignals.nullifierHash, proof: solidityProof }

  response.status(200).json(argument)
}

const getKeyPair = async (request: Request, response: Response, next: NextFunction) => {
  const id: string = request.query.pollId as string
  const pollId = BigInt(id)

  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: "spki",
      format: "pem"
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
      cipher: "aes-256-cbc",
      passphrase: "top secret"
    }
  })

  /*const message = "message"
  const encryptedBuffer = crypto.publicEncrypt(publicKey, Buffer.from(message))
  const decryptedBuffer = crypto.privateDecrypt(
    {
      key: privateKey.toString(),
      passphrase: "top secret"
    },
    encryptedBuffer
  )
  console.log("Encrypted: " + encryptedBuffer.toString("utf-8"))
  console.log("Decrypted: " + decryptedBuffer.toString("utf-8"))*/

  const res = fs.readFileSync("./data.json", { encoding: "utf-8" })
  let polls: PollIdentities[] = JSON.parse(res)

  polls.every((poll) => {
    if (pollId === BigInt(poll.pollId)) {
      poll.publicKey = publicKey
      poll.privateKey = privateKey
      return false
    }
    return true
  })

  fs.writeFileSync("./data.json", JSON.stringify(polls, null, 2), "utf-8")

  response.status(200).json({ key: publicKey })
}

const getDecryptionKey = async (request: Request, response: Response, next: NextFunction) => {
  const id: string = request.query.pollId as string
  const pollId = BigInt(id)

  const res = fs.readFileSync("./data.json", { encoding: "utf-8" })
  let polls: PollIdentities[] = JSON.parse(res)
  let privateKey: string

  polls.every((poll) => {
    if (pollId === BigInt(poll.pollId)) {
      privateKey = poll.privateKey
      return false
    }
    return true
  })

  response.status(200).json({ key: privateKey })
}

const decryptMessage = async (request: Request, response: Response, next: NextFunction) => {
  const message: string = request.query.msg as string
  const key: string = request.query.key as string

  const decryptedBuffer = crypto.privateDecrypt(
    {
      key: key.toString(),
      passphrase: "top secret"
    },
    Buffer.from(message)
  )
  const decryptedMsg = decryptedBuffer.toString()

  response.status(200).json({ msg: decryptedMsg })
}

app.get("/test_getallidentities", getAllIdentities)
app.get("/test_getproof", getProof)
app.get("/getkeypair", getKeyPair)
app.get("/getdecryptionkey", getDecryptionKey)
app.get("/decryptmessage", decryptMessage)

app.listen(port, () => {
  console.log(`SERVER is running on port ${port}.`)
})
