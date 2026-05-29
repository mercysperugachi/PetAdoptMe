// src/features/auth/application/use-cases/RegisterUseCase.ts

import { IAuthRepository } from '../../domain/interfaces/IAuthRepository';
import { User, UserRole } from '../../domain/entities/User';

export class RegisterUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(email: string, password: string, name: string, role: UserRole): Promise<User> {
    return this.authRepository.registerWithEmail(email, password, name, role);
  }
}