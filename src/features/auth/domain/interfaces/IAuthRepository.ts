// src/features/auth/domain/interfaces/IAuthRepository.ts

import { User, UserRole } from '../entities/User';

export interface IAuthRepository {
  loginWithEmail(email: string, password: string): Promise<User>;
  registerWithEmail(email: string, password: string, name: string, role: UserRole, extraData?: Partial<User>): Promise<User>;
  loginWithGoogle(): Promise<User>;
  logout(): Promise<void>;
  updateProfile(userId: string, data: Partial<User>): Promise<User>; // Nuevo método
}