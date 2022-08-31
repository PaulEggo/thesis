import React, { useEffect } from "react"
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"

// @ts-ignore
import Home from "./components/Home.tsx"
// @ts-ignore
import CreatePoll from "./components/CreatePoll.tsx"
// @ts-ignore
import Vote from "./components/Vote.tsx"

import { ethers } from "ethers"
import { abi } from "./utils/abi"

declare global {
  interface window {
    ethereum: any
  }
}

export function App() {
  // @ts-ignore
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()
  const contractAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"

  const contract = new ethers.Contract(contractAddress, abi, signer)

  useEffect(() => {
    document.title = "Anonymous voting Dapp"

    const connectMetamask = async () => {
      await provider.send("eth_requestAccounts", [])
      const deployed = await contract._deployed()
      console.log(deployed)
    }

    connectMetamask().catch(console.error)
  })

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/create" element={<CreatePoll contract={contract} />}></Route>
        <Route path="/vote" element={<Vote contract={contract} signer={signer} />}></Route>
      </Routes>
    </Router>
  )
}
