import { create } from 'zustand';
import { Pet } from '../../domain/entities/Pet';

type PetState = {
  pets: Pet[];
  isLoading: boolean;
  error: string | null;
  setPets: (pets: Pet[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
};

export const usePetStore = create<PetState>((set) => ({
  pets: [],
  isLoading: false,
  error: null,
  setPets: (pets) => set({ pets }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));