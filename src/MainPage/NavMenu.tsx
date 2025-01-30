import { FC } from "react"
import { useAuthenticator, Menu, MenuItem, Divider, View } from "@aws-amplify/ui-react"
import { useSessionStore } from "../Hooks/session"

const NavMenu: FC = () => {
  const { isInGameMode, leaveGameMode } = useSessionStore()
  const { authStatus } = useAuthenticator((context) => [context.authStatus])

  return (
    <View alignSelf="center" width="3rem" display="flex">
      <Menu style={{ zIndex: 1300 }}>
        <MenuItem onClick={() => alert("TODO: Game Rules")}> Game Rules</MenuItem>
        <MenuItem onClick={() => alert("TODO: About")}>Terms and Conditions</MenuItem>
        <Divider />
        {authStatus === "authenticated" && (
          <>
            <MenuItem onClick={() => alert("TODO: Show User Profile Modal")}>User Profile</MenuItem>
          </>
        )}
        {authStatus === "authenticated" && isInGameMode && (
          <>
            <MenuItem onClick={leaveGameMode}>Exit Game</MenuItem>
          </>
        )}
      </Menu>
    </View>
  )
}

export default NavMenu
