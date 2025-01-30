import { create } from "zustand"
import { GameSessionData } from "../../amplify/shared/game"
export type { GameSessionData as SessionData } from "../../amplify/shared/game"

type userData = {
  userId: string
  userName: string
  userEmail: string
}

interface SessionState {
  isInGameMode: boolean
  sessionData: GameSessionData | null
  currentUser: userData | null
  initSessionData: (sessionProps: GameSessionData) => void
  updateSessionData: (sessionProps: Partial<GameSessionData>) => void
  enterGameMode: () => void
  leaveGameMode: () => void
  setCurrentUser: (userData?: userData) => void
}

export const useSessionStore = create<SessionState>((set) => ({
  isInGameMode: false,
  currentUser: null,
  sessionData: null,
  initSessionData: (sessionProps: GameSessionData) => {
    set({ sessionData: sessionProps })
  },
  updateSessionData: (sessionProps) =>
    set((state) => {
      if (state.sessionData) {
        return { sessionData: { ...state.sessionData, ...sessionProps } }
      } else {
        return {}
      }
    }),
  enterGameMode: () => set({ isInGameMode: true }),
  leaveGameMode: () => set({ isInGameMode: false, sessionData: null }),
  setCurrentUser: (userData) => set({ currentUser: userData ?? null }),
}))

// call outside of react context
export const updateSessionData = (sessionProps: Partial<GameSessionData>) => {
  useSessionStore.getState().updateSessionData(sessionProps)
}