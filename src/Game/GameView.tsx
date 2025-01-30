import { FC, useRef, useEffect, ReactNode } from "react"
import { BuluChessGame } from "./ChessGame/main"
import { useSessionStore, SessionData } from "../Hooks/session"
import { Button } from "@aws-amplify/ui-react"
import "./GameView.css"

export const GameViewport: FC = () => {
  const { initSessionData, currentUser } = useSessionStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const gameInstanceRef = useRef<BuluChessGame | null>(null)

  useEffect(() => {
    if (containerRef.current) {
      // get session data from request...
      const playerRole = "both"
      const sessionData: SessionData = {
        sessionId: "u9-eaf-120-21", // only init
        gameMode: "11x", // only init
        playerMode: "self", // only init
        playerRole: playerRole, // only init
        playerW: currentUser ? currentUser.userName : "Unknown", // only init
        playerB: currentUser ? currentUser.userName : "Unknown", // only init
        playerTurn: "w", // dynamic
        orientation: "WHITE_BOTTOM", // only init
        timeTotal: 0,
        timeLeft: 0,
      }

      initSessionData(sessionData)
      gameInstanceRef.current = new BuluChessGame(containerRef.current, sessionData)
      gameInstanceRef.current.initialise()
    }
    return () => {
      if (gameInstanceRef.current) {
        gameInstanceRef.current.dispose()
      }
    }
  }, [])

  return <div ref={containerRef} className="game-view"></div>
}

interface GameOverlayProps {
  onLeaveGame: () => void
  onPauseGame: () => void
}

export const GameOverlay: FC<GameOverlayProps> = ({ onLeaveGame, onPauseGame }) => {
  const { sessionData, updateSessionData, currentUser } = useSessionStore()

  useEffect(() => {
    // todo: update live with other info
    if (currentUser) {
      updateSessionData({ playerB: currentUser.userName, playerW: currentUser.userName })
    }
  }, [currentUser])

  let time = "00:00"
  if (sessionData) {
    const seconds = sessionData.timeTotal
    if (seconds < 3600) time = new Date(seconds * 1000).toISOString().substring(14, 19)
    else time = new Date(seconds * 1000).toISOString().substring(11, 16)
  }

  return (
    <>
      <div className="game-overlay-container__left">
        <Button className="game-overlay-button" variation="primary" onClick={onLeaveGame}>
          Quit
        </Button>
        <Button className="game-overlay-button" variation="primary" onClick={onPauseGame}>
          Pause
        </Button>
      </div>
      {sessionData && (
        <div className="game-overlay-container__right">
          <p>Turn: {sessionData.playerTurn === "b" ? "Black" : "White"}</p>
          <p>Time: {time}</p>
          <p>Black: {sessionData.playerB}</p>
          <p>White: {sessionData.playerW}</p>
        </div>
      )}
    </>
  )
}

interface GameWrapperProps {
  children: ReactNode
}

export const GameWrapper: FC<GameWrapperProps> = ({ children }) => {
  return <div className="game-wrapper">{children}</div>
}
