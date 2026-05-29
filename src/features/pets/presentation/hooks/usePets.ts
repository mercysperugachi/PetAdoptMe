import { usePetStore } from '../store/petStore';
import { SupabasePetRepository } from '../../infrastructure/repositories/SupabasePetRepository';
import { ManagePetsUseCase } from '../../application/use-cases/ManagePetsUseCase';
import { CreatePetDTO } from '../../domain/entities/Pet';
import { useAuthStore } from '../../../auth/presentation/store/authStore';

export const usePets = () => {
  const { pets, isLoading, error } = usePetStore();
  const setPets = usePetStore((state) => state.setPets);
  const setLoading = usePetStore((state) => state.setLoading);
  const setError = usePetStore((state) => state.setError);
  
  const user = useAuthStore((state) => state.user);

  const loadAllPets = async () => {
    setLoading(true);
    try {
      const repo = new SupabasePetRepository();
      const useCase = new ManagePetsUseCase(repo);
      const data = await useCase.fetchAllPets();
      setPets(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createPet = async (petData: CreatePetDTO) => {
    if (!user || user.role !== 'refugio') {
      throw new Error('Solo los refugios pueden registrar mascotas.');
    }
    setLoading(true);
    try {
      const repo = new SupabasePetRepository();
      const useCase = new ManagePetsUseCase(repo);
      await useCase.addPet(user.id, petData);
      await loadAllPets(); // Recargar la lista
    } catch (err: any) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deletePet = async (petId: string) => {
    setLoading(true);
    try {
      const repo = new SupabasePetRepository();
      const useCase = new ManagePetsUseCase(repo);
      await useCase.removePet(petId);
      await loadAllPets();
    } catch (err: any) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { pets, isLoading, error, loadAllPets, createPet, deletePet };
};