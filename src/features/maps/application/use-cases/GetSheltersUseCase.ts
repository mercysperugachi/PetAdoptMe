import { IMapRepository } from '../../domain/interfaces/IMapRepository';
import { ShelterLocation } from '../../domain/entities/Location';

export class GetSheltersUseCase {
  constructor(private readonly mapRepo: IMapRepository) {}

  async execute(): Promise<ShelterLocation[]> {
    return this.mapRepo.getShelters();
  }
}