import { create } from 'zustand';
import api from '../lib/api';
import type { User } from '../types';

// Default mock admin user when auth is commented out
const DEFAULT_USER: User = {
  id: 'admin',
  name: 'Admin',
  username: 'admin',
  role: 'ADMIN',
};

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  setRole: (role: 'ADMIN' | 'EMPLOYEE') => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // ===== AUTH COMMENTED OUT — DEFAULT TO AUTHENTICATED ADMIN =====
  user: JSON.parse(localStorage.getItem('user') || JSON.stringify(DEFAULT_USER)),
  token: localStorage.getItem('token') || 'bypass-token',
  isAuthenticated: true,
  isLoading: false,

  login: async (username: string, password: string) => {
    try {
      const { data } = await api.post('/auth/login', { username, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, isAuthenticated: true });
    } catch {
      // Fallback if backend auth fails
      set({ user: DEFAULT_USER, token: 'bypass-token', isAuthenticated: true });
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: DEFAULT_USER, token: 'bypass-token', isAuthenticated: true });
  },

  checkAuth: async () => {
    try {
      const { data } = await api.get('/auth/me');
      if (data) {
        localStorage.setItem('user', JSON.stringify(data));
        set({ user: data, isAuthenticated: true, isLoading: false });
        return;
      }
    } catch {
      // Auth bypassed — retain active state
    }
    const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
    set({ user: storedUser || DEFAULT_USER, isAuthenticated: true, isLoading: false });
  },

  setRole: (role: 'ADMIN' | 'EMPLOYEE') => {
    set((state) => {
      const updatedUser = { ...(state.user || DEFAULT_USER), role };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return { user: updatedUser };
    });
  },
}));

// Derived selectors
export const useIsAdmin = () => useAuthStore((s) => s.user?.role === 'ADMIN');
export const useIsEmployee = () => useAuthStore((s) => s.user?.role === 'EMPLOYEE');
