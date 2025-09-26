import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode, type FC } from 'react';
import { api } from '../lib/api';
import type { AuthContextValue, AuthUser } from './contextTypes';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = 'token';
const USER_KEY = 'auth_user';

interface IAuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: FC<IAuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const tokenKey = localStorage.getItem(TOKEN_KEY);
    const userKey = localStorage.getItem(USER_KEY);

    setToken(tokenKey);
    setUser(userKey ? (JSON.parse(userKey) as AuthUser) : null);
  }, []);

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

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token || user) return;
      try {
        const { data } = await api.get('/auth/me');
        if (data?.user) {
          setUser(data.user as AuthUser);
          localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        }
      } catch {
        logout();
      }
    }
    void fetchProfile()
  }, [token, user, logout]);

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