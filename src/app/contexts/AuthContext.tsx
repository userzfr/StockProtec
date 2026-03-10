import { createContext, useContext, ReactNode } from 'react';
import { User } from '@/app/App';

interface AuthContextType {
  currentUser: User;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
  user: User;
  onLogout: () => void;
}

export function AuthProvider({ children, user, onLogout }: AuthProviderProps) {
  return (
    <AuthContext.Provider value={{ currentUser: user, logout: onLogout }}>
      {children}
    </AuthContext.Provider>
  );
}
