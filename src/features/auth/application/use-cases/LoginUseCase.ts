// src/features/auth/application/use-cases/LoginUseCase.ts

import { IAuthRepository } from '../../domain/interfaces/IAuthRepository';
import { User } from '../../domain/entities/User';

export class LoginUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(email: string, password: string): Promise<User> {
    return this.authRepository.loginWithEmail(email, password);
  }
}