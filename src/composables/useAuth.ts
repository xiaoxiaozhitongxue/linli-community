import { useAuth as useStoreAuth } from '../store'
import type { User } from '../types/models'

export function useAuth() {
  const {
    user,
    token,
    userData,
    isLoggedIn,
    initAuth,
    setUser,
    logout,
    updateUser,
    getCurrentPhone
  } = useStoreAuth()

  return {
    isLoggedIn,
    user,
    token,
    userData,
    initAuth,
    setUser,
    logout,
    updateUser,
    getCurrentPhone
  }
}
