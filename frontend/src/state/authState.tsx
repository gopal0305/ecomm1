import React, { createContext, useContext, useMemo, useState } from 'react';
import axios from 'axios';

type AuthContextValue = {
  token: string | null;
  logout: () => void;
  loginWithToken: (token: string) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readToken(): string | null {
  try {
    const v = localStorage.getItem('token');
    return v ? v : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(readToken());

  const logout = () => {
    setToken(null);
    try {
      localStorage.removeItem('token');
    } catch {
      // ignore
    }
    delete axios.defaults.headers.common['Authorization'];
  };

  const loginWithToken = (newToken: string) => {
    setToken(newToken);
    try {
      localStorage.setItem('token', newToken);
    } catch {
      // ignore
    }
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  const value = useMemo<AuthContextValue>(() => ({ token, logout, loginWithToken }), [token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

