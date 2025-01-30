import { FC, useEffect } from "react"
import { useAuthenticator, Button, Flex, Heading, Card } from "@aws-amplify/ui-react"
import { fetchUserAttributes } from "aws-amplify/auth"
import { useSessionStore } from "../Hooks/session"
import NavMenu from "./NavMenu"
import "./HeaderBar.css"

interface HeaderBarProps {
  showSignIn: (showSignIn: boolean) => void
}

const HeaderBar: FC<HeaderBarProps> = ({ showSignIn }) => {
  const { user, signOut } = useAuthenticator((context) => [context.user])
  const { currentUser, setCurrentUser } = useSessionStore()

  const fetchUserInfo = async () => {
    try {
      const { email, preferred_username } = await fetchUserAttributes()
      setCurrentUser({
        userEmail: email ?? "Unknown",
        userId: user.userId,
        userName: preferred_username ?? "Unknown",
      })
    } catch (error) {
      console.error("Error fetching user information:", error)
    }
  }

  useEffect(() => {
    if (user) fetchUserInfo()
  }, [user])

  const handleShowSignIn = () => {
    showSignIn(true)
  }

  const handleHome = () => {
    showSignIn(false)
  }

  return (
    <Flex
      position="sticky"
      direction="row"
      height="5rem"
      width="100%"
      justifyContent="space-around"
      alignItems="center"
      alignContent="center"
      marginBottom={30}
      padding={5}
      backgroundColor="rgba(255,255,255,1)"
      style={{ zIndex: 1200 }}
    >
      <Flex direction="row" gap="0.2rem">
        <NavMenu />
        <Card onClick={handleHome} backgroundColor={"transparent"}>
          <Heading level={3} color="hsl(190, 95%, 30%)" fontFamily="Brush Script MT">
            Bulu Chess
          </Heading>
        </Card>
        {currentUser && (
          <p>
            {" "}
            Welcome <strong>{currentUser.userEmail}</strong>{" "}
          </p>
        )}
      </Flex>

      <Button variation="primary" onClick={user ? signOut : handleShowSignIn}>
        {user ? "Sign-Out" : "Sign-In"}
      </Button>
    </Flex>
  )
}

export default HeaderBar
