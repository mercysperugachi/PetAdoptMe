import { useMapStore } from '../store/mapStore';
import { SupabaseMapRepository } from '../../infrastructure/repositories/SupabaseMapRepository';
import { GetSheltersUseCase } from '../../application/use-cases/GetSheltersUseCase';

export const useMap = () => {
  const { locations, isLoading } = useMapStore();
  const setLocations = useMapStore((state) => state.setLocations);
  const setLoading = useMapStore((state) => state.setLoading);

  const loadLocations = async () => {
    setLoading(true);
    try {
      const repo = new SupabaseMapRepository();
      const useCase = new GetSheltersUseCase(repo);
      const data = await useCase.execute();
      setLocations(data);
    } catch (err) {
      console.error('Error cargando ubicaciones:', err);
    } finally {
      setLoading(false);
    }
  };

  return { locations, isLoading, loadLocations };
};