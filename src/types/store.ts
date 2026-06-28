import type { User, Post, Activity, Task } from './models'

export interface UserData {
  posts: Post[]
  activities: Activity[]
  tasks: Task[]
  myCreatedTasks: Task[]
  myAcceptedTasks: Task[]
  messages: any[]
  notifications: any[]
}

export interface AuthState {
  user: User | null
  token: string
  userData: UserData
  isLoggedIn: boolean
}

export interface StoreState {
  auth: AuthState
}

export interface AuthActions {
  initAuth: () => void
  setUser: (user: User, token: string, userData?: UserData) => void
  setUserData: (data: UserData) => void
  logout: () => void
  updateUser: (partialUser: Partial<User>) => void
  getCurrentPhone: () => string | null
}

export type AuthStore = AuthState & AuthActions
