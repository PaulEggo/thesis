import { Strategy, ZkIdentity } from "@zk-kit/identity"
import { Semaphore, SemaphorePublicSignals, SemaphoreSolidityProof } from "@zk-kit/protocols"
import { expect } from "chai"
import { Signer, utils } from "ethers"
import { ethers, run } from "hardhat"
import { AnonymousVoting } from "../build/typechain"
import { createMerkleProof } from "./utils"

describe.only("AnonymousVotingTesting", async () => {
  const NUMBER_OF_MEMBERS = 10

  let contract: AnonymousVoting
  let accounts: Signer[]
  let coordinator: string

  let candidateAddresses = [
    "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
    "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
    "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc"
  ]

  const depth = 20
  let identities: ZkIdentity[] = []
  let comms: bigint[] = []

  const pollId = BigInt(1)
  const encryptionKey = "0"
  const decryptionKey = "1"

  const wasmFilePath = "./build/snark/semaphore.wasm"
  const finalZkeyPath = "./build/snark/semaphore_final.zkey"

  before(async () => {
    const { address: verifierAddress } = await run("deploy:verifier", { logs: false })
    contract = await run("deploy:anonymous-voting", { logs: false, verifier: verifierAddress })
    accounts = await ethers.getSigners()
    coordinator = await accounts[0].getAddress()

    for (let i = 0; i < NUMBER_OF_MEMBERS; i++) {
      let identity = new ZkIdentity(Strategy.MESSAGE, i.toString())
      let comm = identity.genIdentityCommitment()

      identities.push(identity)
      comms.push(comm)
    }
  })

  describe("# Test for different number of members", async () => {
    it(NUMBER_OF_MEMBERS.toString() + " members", async () => {
      await contract.connect(accounts[0]).createPoll(pollId, coordinator, depth, candidateAddresses)

      for (let i = 0; i < NUMBER_OF_MEMBERS; i++) {
        await contract.connect(accounts[i]).addVoter(pollId, comms[i])
      }

      await contract.connect(accounts[0]).startPoll(pollId, encryptionKey)

      for (let i = 0; i < NUMBER_OF_MEMBERS; i++) {
        const bytes32Vote = utils.formatBytes32String("0")

        const merkleProof = createMerkleProof(comms, comms[i])
        const witness = Semaphore.genWitness(
          identities[i].getTrapdoor(),
          identities[i].getNullifier(),
          merkleProof,
          pollId,
          "0"
        )

        let solidityProof: SemaphoreSolidityProof
        let publicSignals: SemaphorePublicSignals

        const fullProof = await Semaphore.genProof(witness, wasmFilePath, finalZkeyPath)
        publicSignals = fullProof.publicSignals
        solidityProof = Semaphore.packToSolidityProof(fullProof.proof)

        await contract.connect(accounts[i]).castVote(bytes32Vote, publicSignals.nullifierHash, pollId, solidityProof)
      }

      await contract.connect(accounts[0]).endPoll(pollId, decryptionKey)
    })
  })
})
