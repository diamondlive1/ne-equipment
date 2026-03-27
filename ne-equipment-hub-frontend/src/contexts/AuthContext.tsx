import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';

export interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    role: string;
    nuit?: string;
    is_active: boolean;
    is_superadmin?: boolean;
    avatar?: string;
}


interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (data: any) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUser = async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            const response = await api.get('/user');
            setUser(response.data);
        } catch (error) {
            console.error('Failed to fetch user', error);
            localStorage.removeItem('auth_token');
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const login = async (credentials: any) => {
        const response = await api.post('/login', credentials);
        const { token, user } = response.data;
        localStorage.setItem('auth_token', token);
        setUser(user);
        // Also update instances default header if needed instantly
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        return response.data;
    };

    const register = async (data: any) => {
        // A ser implementado no backend
        const response = await api.post('/register', data);
        const { token, user } = response.data;
        localStorage.setItem('auth_token', token);
        setUser(user);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        return response.data;
    };

    const logout = async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error('Logout failed', error);
        } finally {
            localStorage.removeItem('auth_token');
            delete api.defaults.headers.common['Authorization'];
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            login,
            register,
            logout,
            isAuthenticated: !!user
        }}>
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
