// src/features/auth/presentation/store/authStore.ts

import { create } from 'zustand';
import { User } from '../../domain/entities/User';

type AuthState = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
};

type AuthActions = {
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
};

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));