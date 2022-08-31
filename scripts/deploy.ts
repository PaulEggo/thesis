// @ts-nocheck
import { ethers, run } from "hardhat"

async function main() {
  const { address: verifierAddress } = await run("deploy:verifier", {
    logs: true
  })

  await run("deploy:anonymous-voting", {
    logs: true,
    verifier: verifierAddress
  })
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
