import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  token: string | null;
  role: string | null;
  login: (token: string, role: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'));
  const [role, setRole] = useState<string | null>(localStorage.getItem('admin_role'));

  useEffect(() => {
    if (token && role) {
      localStorage.setItem('admin_token', token);
      localStorage.setItem('admin_role', role);
    } else {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_role');
    }
  }, [token, role]);

  const login = (newToken: string, newRole: string) => {
    setToken(newToken);
    setRole(newRole);
  };

  const logout = () => {
    setToken(null);
    setRole(null);
  };

  const isAuthenticated = !!token && role !== 'USER';

  return (
    <AuthContext.Provider value={{ token, role, login, logout, isAuthenticated }}>
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
