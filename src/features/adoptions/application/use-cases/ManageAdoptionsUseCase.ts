import { IAdoptionRepository } from '../../domain/interfaces/IAdoptionRepository';
import { AdoptionRequest, AdoptionStatus } from '../../domain/entities/Adoption';

export class ManageAdoptionsUseCase {
  constructor(private readonly adoptionRepository: IAdoptionRepository) {}

  async applyForPet(petId: string, shelterId: string, applicantId: string): Promise<AdoptionRequest> {
    return this.adoptionRepository.createRequest(petId, shelterId, applicantId);
  }

  async fetchShelterRequests(shelterId: string): Promise<AdoptionRequest[]> {
    return this.adoptionRepository.getRequestsForShelter(shelterId);
  }

  async fetchApplicantRequests(applicantId: string): Promise<AdoptionRequest[]> {
    return this.adoptionRepository.getRequestsForApplicant(applicantId);
  }

  async changeRequestStatus(requestId: string, status: AdoptionStatus): Promise<void> {
    return this.adoptionRepository.updateStatus(requestId, status);
  }
}