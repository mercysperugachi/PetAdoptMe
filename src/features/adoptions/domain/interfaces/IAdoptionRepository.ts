import { AdoptionRequest, AdoptionStatus } from '../entities/Adoption';

export interface IAdoptionRepository {
  createRequest(petId: string, shelterId: string, applicantId: string): Promise<AdoptionRequest>;
  getRequestsForShelter(shelterId: string): Promise<AdoptionRequest[]>;
  getRequestsForApplicant(applicantId: string): Promise<AdoptionRequest[]>;
  updateStatus(requestId: string, status: AdoptionStatus): Promise<void>;
}