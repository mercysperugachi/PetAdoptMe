import { IPetRepository } from '../../domain/interfaces/IPetRepository';
import { Pet, CreatePetDTO } from '../../domain/entities/Pet';
import { supabase } from '../../../../core/config/supabase';

export class SupabasePetRepository implements IPetRepository {
  
  async getPets(): Promise<Pet[]> {
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getShelterPets(shelterId: string): Promise<Pet[]> {
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .eq('shelter_id', shelterId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createPet(shelterId: string, data: CreatePetDTO): Promise<Pet> {
    let imageUrl = null;

    // 1. Subir la imagen si existe
    if (data.imageUri) {
      try {
        const ext = data.imageUri.substring(data.imageUri.lastIndexOf('.') + 1);
        const fileName = `${shelterId}/${Date.now()}.${ext}`;
        
        // Solución para React Native: Usamos FormData en lugar de fetch().blob()
        const formData = new FormData();
        formData.append('file', {
          uri: data.imageUri,
          name: fileName,
          type: `image/${ext}`
        } as any);

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('pets-images')
          .upload(fileName, formData);

        if (uploadError) throw uploadError;

        // Obtener URL pública
        const { data: publicUrlData } = supabase.storage
          .from('pets-images')
          .getPublicUrl(uploadData.path);
          
        imageUrl = publicUrlData.publicUrl;
      } catch (err) {
        console.error('Error subiendo imagen:', err);
        throw new Error('No se pudo subir la foto. Verifica tu conexión.');
      }
    }

    // 2. Guardar el registro en la base de datos
    const { data: newPet, error } = await supabase
      .from('pets')
      .insert({
        shelter_id: shelterId,
        name: data.name,
        species: data.species,
        breed: data.breed,
        age: data.age,
        size: data.size,
        description: data.description,
        image_url: imageUrl,
      })
      .select()
      .single();

    if (error) throw error;
    return newPet;
  }


  async deletePet(petId: string): Promise<void> {
    const { error } = await supabase.from('pets').delete().eq('id', petId);
    if (error) throw error;
  }
}