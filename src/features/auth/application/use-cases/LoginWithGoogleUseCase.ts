import { IAuthRepository } from '../../domain/interfaces/IAuthRepository';
import { User } from '../../domain/entities/User';

export class LoginWithGoogleUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(): Promise<User> {
    return this.authRepository.loginWithGoogle();
  }
}