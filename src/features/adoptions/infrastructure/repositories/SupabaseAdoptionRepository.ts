import { IAdoptionRepository } from '../../domain/interfaces/IAdoptionRepository';
import { AdoptionRequest, AdoptionStatus } from '../../domain/entities/Adoption';
import { supabase } from '../../../../core/config/supabase';

export class SupabaseAdoptionRepository implements IAdoptionRepository {
  
  async createRequest(petId: string, shelterId: string, applicantId: string): Promise<AdoptionRequest> {
    const { data, error } = await supabase
      .from('adoption_requests')
      .insert({
        pet_id: petId,
        shelter_id: shelterId,
        applicant_id: applicantId,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getRequestsForShelter(shelterId: string): Promise<AdoptionRequest[]> {
    const { data, error } = await supabase
      .from('adoption_requests')
      .select('*, pets(name, image_url), profiles(name, email, phone)') // 🔥 Añade "phone" al query
      .eq('shelter_id', shelterId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getRequestsForApplicant(applicantId: string): Promise<AdoptionRequest[]> {
    const { data, error } = await supabase
      .from('adoption_requests')
      .select('*, pets(name, image_url), profiles(name, email, phone)') // 🔥 Añade "phone" al query
      .eq('applicant_id', applicantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async updateStatus(requestId: string, status: AdoptionStatus): Promise<void> {
    const { error } = await supabase
      .from('adoption_requests')
      .update({ status })
      .eq('id', requestId);

    if (error) throw error;
  }
}