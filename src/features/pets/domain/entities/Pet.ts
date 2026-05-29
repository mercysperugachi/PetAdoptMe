export interface Pet {
  id: string;
  shelter_id: string;
  name: string;
  species: string;
  breed?: string;
  age?: number;
  size?: string;
  description?: string;
  image_url?: string;
  created_at?: string;
}

export interface CreatePetDTO {
  name: string;
  species: string;
  breed?: string;
  age?: number;
  size?: string;
  description?: string;
  imageUri?: string; 
}