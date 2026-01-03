import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const mockUsers: User[] = [
  {
    id: '1',
    employeeId: 'OIJODO20220001',
    email: 'admin@dayflow.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: 'admin',
    jobTitle: 'HR Manager',
    department: 'Human Resources',
    avatar: '',
    phone: '+1 (555) 123-4567',
    joinDate: '2020-03-15',
    status: 'present',
  },
  {
    id: '2',
    employeeId: 'OIJODO20220002',
    email: 'employee@dayflow.com',
    firstName: 'John',
    lastName: 'Smith',
    role: 'employee',
    jobTitle: 'Software Engineer',
    department: 'Engineering',
    avatar: '',
    phone: '+1 (555) 987-6543',
    joinDate: '2021-06-01',
    status: 'present',
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const foundUser = mockUsers.find(u => u.email === email);
    if (foundUser && password === 'password123') {
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      logout,
      isAdmin: user?.role === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
