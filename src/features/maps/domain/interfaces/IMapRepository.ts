import { ShelterLocation } from '../entities/Location';

export interface IMapRepository {
  getShelters(): Promise<ShelterLocation[]>;
}