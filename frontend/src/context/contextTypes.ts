export type AuthUser = {
    id: string
    email: string
    role?: string
}
  
export type AuthContextValue = {
    token: string | null
    user: AuthUser | null
    isAuthenticated: boolean
    login: (token: string, user?: AuthUser) => void
    logout: () => void
}