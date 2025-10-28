import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface JiraCredentials {
  domain: string;
  email: string;
  apiToken: string;
}

interface AuthContextType {
  credentials: JiraCredentials | null;
  isAuthenticated: boolean;
  login: (credentials: JiraCredentials) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [credentials, setCredentials] = useState<JiraCredentials | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar se há credenciais salvas no localStorage
    const savedCredentials = localStorage.getItem('jira-credentials');
    if (savedCredentials) {
      try {
        const parsed = JSON.parse(savedCredentials);
        setCredentials(parsed);
      } catch (error) {
        console.error('Error parsing saved credentials:', error);
        localStorage.removeItem('jira-credentials');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (newCredentials: JiraCredentials) => {
    setCredentials(newCredentials);
    localStorage.setItem('jira-credentials', JSON.stringify(newCredentials));
  };

  const logout = () => {
    setCredentials(null);
    localStorage.removeItem('jira-credentials');
  };

  const value: AuthContextType = {
    credentials,
    isAuthenticated: !!credentials,
    login,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};















