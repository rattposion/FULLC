"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/admin';
import ApiService from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface LoginResponse {
  token: string;
  user: User;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      fetchUserProfile(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await ApiService.getUserProfile();
      if (response.data) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Erro ao buscar perfil do usuário:', error);
      localStorage.removeItem('token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await ApiService.login(email, password);
      if (response.data) {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        setToken(token);
        setUser({
          id: user.id,
          username: user.username,
          email: user.email,
          isAdmin: user.isAdmin,
          createdAt: new Date()
        });
      } else {
        throw new Error(response.error || 'Erro ao fazer login');
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const loadUser = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await ApiService.getUserProfile();
        if (response.data) {
          setUser({
            id: response.data.id,
            username: response.data.username,
            email: response.data.email,
            isAdmin: response.data.isAdmin,
            createdAt: new Date()
          });
          setToken(token);
        }
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
} 