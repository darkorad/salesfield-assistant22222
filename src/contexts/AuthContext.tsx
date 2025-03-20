
import React, { createContext, useContext, ReactNode } from 'react';
import { useAuthStatus, AuthStatus } from '@/hooks/useAuthStatus';

// Create auth context with default values
const AuthContext = createContext<AuthStatus>({
  isLoading: true,
  isAuthenticated: false,
  connectionError: false,
  permissionError: false
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Use the existing hook to get auth status
  const authStatus = useAuthStatus();
  
  return (
    <AuthContext.Provider value={authStatus}>
      {children}
    </AuthContext.Provider>
  );
};

// Create a custom hook for easy access to auth context
export const useAuth = () => {
  return useContext(AuthContext);
};
