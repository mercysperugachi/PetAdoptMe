import { IAuthRepository } from '../../domain/interfaces/IAuthRepository';
import { User } from '../../domain/entities/User';

export class UpdateProfileUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}
  async execute(userId: string, data: Partial<User>): Promise<User> {
    return this.authRepository.updateProfile(userId, data);
  }
}