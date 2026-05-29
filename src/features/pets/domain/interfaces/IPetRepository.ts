import { Pet, CreatePetDTO } from '../entities/Pet';

export interface IPetRepository {
  getPets(): Promise<Pet[]>;
  getShelterPets(shelterId: string): Promise<Pet[]>;
  createPet(shelterId: string, data: CreatePetDTO): Promise<Pet>;
  deletePet(petId: string): Promise<void>;
}