import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react"

import { Amplify } from "aws-amplify"
import "@aws-amplify/ui-react/styles.css"

// import { getUrl } from "aws-amplify/storage"
// import { uploadData } from "aws-amplify/storage"
import { generateClient } from "aws-amplify/data"
import type { Schema } from "../amplify/data/resource"
import outputs from "../amplify_outputs.json"

import HeaderBar from "./MainPage/HeaderBar"
import VisitorHome from "./MainPage/VisitorHome"
import Dashboard from "./Dashboard/Dashboard"
import { useState } from "react"

// Backend Client - Amplify
Amplify.configure(outputs)
const client = generateClient<Schema>({
  authMode: "userPool",
})

export default function App() {
  const [showAuth, setShowAuth] = useState<boolean>(false)
  const { authStatus } = useAuthenticator((context) => [context.authStatus])

  return (
    <>
      <HeaderBar showSignIn={setShowAuth} />

      <div className="main-container">
        {authStatus === "authenticated" ? (
          <Dashboard />
        ) : showAuth ? (
          <Authenticator signUpAttributes={["preferred_username"]} />
        ) : (
          <VisitorHome />
        )}
      </div>

      <div className="background-static"></div>
      <div className="background-tint"></div>
    </>
  )
}
