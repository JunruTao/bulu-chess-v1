// import { StrictMode } from 'react'
import { createRoot } from "react-dom/client"
import { Authenticator, ThemeProvider } from "@aws-amplify/ui-react"
import "./index.css"
import App from "./App.tsx"

createRoot(document.getElementById("root")!).render(
  <Authenticator.Provider>
    <ThemeProvider colorMode="dark">
      <App />
    </ThemeProvider>
  </Authenticator.Provider>
)
