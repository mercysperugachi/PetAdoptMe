import { IMapRepository } from '../../domain/interfaces/IMapRepository';
import { ShelterLocation } from '../../domain/entities/Location';
import { supabase } from '../../../../core/config/supabase';

export class SupabaseMapRepository implements IMapRepository {
  async getShelters(): Promise<ShelterLocation[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, latitude, longitude')
      .eq('role', 'refugio')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

    if (error) throw error;
    return data || [];
  }
}