import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AuthContextValue, AuthUser } from './contextTypes';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = 'token';
const USER_KEY = 'auth_user';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const tokenKey = localStorage.getItem(TOKEN_KEY);
    const userKey = localStorage.getItem(USER_KEY);

    setToken(tokenKey);
    setUser(userKey ? (JSON.parse(userKey) as AuthUser) : null);
  }, [])

  const login = useCallback((nextToken: string, nextUser?: AuthUser) => {
    setToken(nextToken);
    localStorage.setItem(TOKEN_KEY, nextToken);

    if (nextUser) {
      setUser(nextUser);
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    }
  }, [])

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }, [])

    const value = useMemo<AuthContextValue>(() => (
        { token, user, isAuthenticated: Boolean(token), login, logout}
    ), [token, user, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  
  return context;
}


