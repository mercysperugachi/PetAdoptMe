export type AdoptionStatus = 'pending' | 'approved' | 'rejected';

export interface AdoptionRequest {
  id: string;
  pet_id: string;
  applicant_id: string;
  shelter_id: string;
  status: AdoptionStatus;
  created_at: string;
  // Relaciones para mostrar en la interfaz
  pets?: { name: string; image_url: string };
  profiles?: { name: string; email: string };
}