import { Link } from "react-router-dom"
import CSS from "csstype"
import React from "react"

// @ts-ignore
import logo from "../images/vote.png"

function Home() {
  return (
    <>
      <h1 style={headerStyle}>Anonymous Voting App</h1>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <img
          src={logo}
          alt="logo"
          style={{
            //height: null,
            width: "220px",
            borderRadius: "40%"
          }}
        />
      </div>
      <div style={container}>
        <Link style={horizontalComponent} to="/create">
          <button className="button-3" style={{ marginRight: "100px" }}>
            Create a new poll
          </button>
        </Link>
        <Link style={horizontalComponent} to="/vote">
          <button className="button-3">Vote one a poll</button>
        </Link>
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

export default Home
