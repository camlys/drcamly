
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

type UserType = 'patient' | 'doctor' | null;

interface AuthState {
  isAuthenticated: boolean;
  userType: UserType;
  loading: boolean;
}

interface AuthContextType {
  authState: AuthState;
  login: (userType: 'patient' | 'doctor') => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({ 
    isAuthenticated: false, 
    userType: null,
    loading: true,
  });
  const router = useRouter();

  useEffect(() => {
    const storedUserType = localStorage.getItem('userType') as UserType;
    if (storedUserType) {
      setAuthState({ isAuthenticated: true, userType: storedUserType, loading: false });
    } else {
      setAuthState({ isAuthenticated: false, userType: null, loading: false });
    }
  }, []);

  const login = (userType: 'patient' | 'doctor') => {
    localStorage.setItem('userType', userType);
    setAuthState({ isAuthenticated: true, userType, loading: false });
  };

  const logout = () => {
    localStorage.removeItem('userType');
    setAuthState({ isAuthenticated: false, userType: null, loading: false });
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
