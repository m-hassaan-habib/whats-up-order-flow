
import React, { createContext, useState, useContext, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { User, AuthState } from '@/types/auth';
import { toast } from 'sonner';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name?: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('authUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error) {
        console.error('Failed to parse stored user', error);
        localStorage.removeItem('authUser');
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  // Mock database of users
  const [users, setUsers] = useState<{[email: string]: {password: string, user: User}}>(() => {
    const storedUsers = localStorage.getItem('users');
    return storedUsers ? JSON.parse(storedUsers) : {};
  });

  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  const signup = async (email: string, password: string, name?: string): Promise<boolean> => {
    // Check if user already exists
    if (users[email]) {
      toast.error('User with this email already exists');
      return false;
    }

    // Create new user
    const newUser: User = {
      id: uuidv4(),
      email,
      name
    };

    // Store user in our mock database
    setUsers(prev => ({
      ...prev,
      [email]: { password, user: newUser }
    }));

    // Log the user in
    setAuthState({
      user: newUser,
      isAuthenticated: true,
      isLoading: false,
    });

    localStorage.setItem('authUser', JSON.stringify(newUser));
    toast.success('Account created successfully!');
    return true;
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    // Check if user exists and password matches
    const userRecord = users[email];
    if (!userRecord || userRecord.password !== password) {
      toast.error('Invalid email or password');
      return false;
    }

    // Set user as authenticated
    setAuthState({
      user: userRecord.user,
      isAuthenticated: true,
      isLoading: false,
    });

    localStorage.setItem('authUser', JSON.stringify(userRecord.user));
    toast.success('Logged in successfully!');
    return true;
  };

  const logout = () => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    localStorage.removeItem('authUser');
    toast.info('Logged out successfully');
  };

  return (
    <AuthContext.Provider 
      value={{ 
        ...authState, 
        login, 
        signup, 
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
