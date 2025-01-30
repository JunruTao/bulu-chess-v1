import { FC } from "react"
import { Button } from "@aws-amplify/ui-react"
import { GameViewport, GameOverlay, GameWrapper } from "../Game/GameView"
import { useSessionStore } from "../Hooks/session"

const Dashboard: FC = () => {
  const { isInGameMode, enterGameMode, leaveGameMode } = useSessionStore()

  return isInGameMode ? (
    <GameWrapper>
      <GameViewport />
      <GameOverlay onLeaveGame={leaveGameMode} onPauseGame={() => {}} />
    </GameWrapper>
  ) : (
    <div>
      <h1 style={{ color: "white" }}>Dashboard</h1>
      <Button onClick={enterGameMode} variation="primary">
        New Game (self v self)
      </Button>
      <Button variation="primary"> New Game (against a friend)</Button>
      <Button variation="primary"> Continue a game </Button>
      <Button variation="primary"> Join Room </Button>
    </div>
  )
}

export default Dashboard
