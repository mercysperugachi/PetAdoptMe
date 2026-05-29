// src/features/auth/domain/entities/User.ts

export type UserRole = 'adoptante' | 'refugio';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}