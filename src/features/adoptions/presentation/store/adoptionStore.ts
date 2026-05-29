import { create } from 'zustand';
import { AdoptionRequest } from '../../domain/entities/Adoption';

type AdoptionState = {
  requests: AdoptionRequest[];
  isLoading: boolean;
  error: string | null;
  setRequests: (requests: AdoptionRequest[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
};

export const useAdoptionStore = create<AdoptionState>((set) => ({
  requests: [],
  isLoading: false,
  error: null,
  setRequests: (requests) => set({ requests }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));