import { useAdoptionStore } from '../store/adoptionStore';
import { SupabaseAdoptionRepository } from '../../infrastructure/repositories/SupabaseAdoptionRepository';
import { ManageAdoptionsUseCase } from '../../application/use-cases/ManageAdoptionsUseCase';
import { useAuthStore } from '../../../auth/presentation/store/authStore';
import { AdoptionStatus } from '../../domain/entities/Adoption';

export const useAdoptions = () => {
  const { requests, isLoading, error } = useAdoptionStore();
  const setRequests = useAdoptionStore((state) => state.setRequests);
  const setLoading = useAdoptionStore((state) => state.setLoading);
  const setError = useAdoptionStore((state) => state.setError);
  
  const user = useAuthStore((state) => state.user);

  const loadRequests = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const repo = new SupabaseAdoptionRepository();
      const useCase = new ManageAdoptionsUseCase(repo);
      
      let data;
      if (user.role === 'refugio') {
        data = await useCase.fetchShelterRequests(user.id);
      } else {
        data = await useCase.fetchApplicantRequests(user.id);
      }
      setRequests(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const applyForAdoption = async (petId: string, shelterId: string) => {
    if (!user || user.role !== 'adoptante') {
      throw new Error('Solo los adoptantes pueden enviar solicitudes.');
    }
    setLoading(true);
    try {
      const repo = new SupabaseAdoptionRepository();
      const useCase = new ManageAdoptionsUseCase(repo);
      await useCase.applyForPet(petId, shelterId, user.id);
      await loadRequests();
    } catch (err: any) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (requestId: string, status: AdoptionStatus) => {
    if (!user || user.role !== 'refugio') {
      throw new Error('Solo el refugio puede actualizar el estado.');
    }
    setLoading(true);
    try {
      const repo = new SupabaseAdoptionRepository();
      const useCase = new ManageAdoptionsUseCase(repo);
      await useCase.changeRequestStatus(requestId, status);
      await loadRequests();
    } catch (err: any) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { requests, isLoading, error, loadRequests, applyForAdoption, updateStatus };
};