import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '@/types/hrms';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (data: SignupData) => Promise<boolean>;
  logout: () => void;
}

interface SignupData {
  employeeId: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const mockUsers: User[] = [
  {
    id: '1',
    employeeId: 'EMP001',
    email: 'admin@dayflow.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: 'admin',
    department: 'Human Resources',
    position: 'HR Manager',
    phone: '+1 (555) 123-4567',
    address: '123 Corporate Ave, Suite 100',
    joiningDate: '2020-03-15',
    salary: {
      basic: 85000,
      allowances: 15000,
      deductions: 12000,
      netSalary: 88000,
    },
  },
  {
    id: '2',
    employeeId: 'EMP002',
    email: 'employee@dayflow.com',
    firstName: 'Michael',
    lastName: 'Chen',
    role: 'employee',
    department: 'Engineering',
    position: 'Senior Developer',
    phone: '+1 (555) 987-6543',
    address: '456 Tech Street, Apt 201',
    joiningDate: '2021-06-01',
    salary: {
      basic: 75000,
      allowances: 10000,
      deductions: 9500,
      netSalary: 75500,
    },
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const foundUser = mockUsers.find(u => u.email === email);
    if (foundUser && password.length >= 6) {
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const signup = async (data: SignupData): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newUser: User = {
      id: Date.now().toString(),
      employeeId: data.employeeId,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      department: data.role === 'admin' ? 'Human Resources' : 'General',
      position: data.role === 'admin' ? 'HR Officer' : 'Staff',
      phone: '',
      address: '',
      joiningDate: new Date().toISOString().split('T')[0],
      salary: {
        basic: 50000,
        allowances: 5000,
        deductions: 5500,
        netSalary: 49500,
      },
    };
    
    setUser(newUser);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout }}>
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
