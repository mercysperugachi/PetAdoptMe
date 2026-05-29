// src/features/auth/domain/entities/User.ts

export type UserRole = 'adoptante' | 'refugio';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  document_id?: string;
  phone?: string;
  address?: string;
  occupation?: string;
  experience?: string;
  home_description?: string;
  latitude?: number;
  longitude?: number;

}