// AuthProvider.tsx
import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { AuthUser } from '../types/auth';

// Define the shape of the context
interface AuthContextType {
    user: any;
    login: (userData: AuthUser) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the provider component
const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user, login, logout, isAuthenticated } = useAuth();

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use the AuthContext
const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};

export { AuthProvider, useAuthContext };