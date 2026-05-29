import { IPetRepository } from '../../domain/interfaces/IPetRepository';
import { Pet, CreatePetDTO } from '../../domain/entities/Pet';

export class ManagePetsUseCase {
  constructor(private readonly petRepository: IPetRepository) {}

  async fetchAllPets(): Promise<Pet[]> {
    return this.petRepository.getPets();
  }

  async fetchMyShelterPets(shelterId: string): Promise<Pet[]> {
    return this.petRepository.getShelterPets(shelterId);
  }

  async addPet(shelterId: string, data: CreatePetDTO): Promise<Pet> {
    if (!data.name || !data.species) {
      throw new Error('El nombre y la especie son obligatorios.');
    }
    return this.petRepository.createPet(shelterId, data);
  }

  async removePet(petId: string): Promise<void> {
    return this.petRepository.deletePet(petId);
  }

  async editPet(petId: string, data: Partial<CreatePetDTO>): Promise<Pet> {
    return this.petRepository.updatePet(petId, data);
  }
}