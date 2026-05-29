import { create } from 'zustand';
import { ShelterLocation } from '../../domain/entities/Location';

type MapState = {
  locations: ShelterLocation[];
  isLoading: boolean;
  setLocations: (locs: ShelterLocation[]) => void;
  setLoading: (loading: boolean) => void;
};

export const useMapStore = create<MapState>((set) => ({
  locations: [],
  isLoading: false,
  setLocations: (locations) => set({ locations }),
  setLoading: (loading) => set({ isLoading: loading }),
}));