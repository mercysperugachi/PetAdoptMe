// src/features/auth/presentation/hooks/useAuth.ts

import { User, UserRole } from '../../domain/entities/User';
import { LoginUseCase } from '../../application/use-cases/LoginUseCase';
import { LoginWithGoogleUseCase } from '../../application/use-cases/LoginWithGoogleUseCase';
import { RegisterUseCase } from '../../application/use-cases/RegisterUseCase';
import { SupabaseAuthRepository } from '../../infrastructure/repositories/SupabaseAuthRepository';
import { useAuthStore } from '../store/authStore';
import { UpdateProfileUseCase } from '../../application/use-cases/UpdateProfileUseCase';

export const useAuth = () => {
  // Obtener las acciones desde el store (usando selector)
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);
  const setError = useAuthStore((state) => state.setError);
  const user = useAuthStore((state) => state.user);

  // Caso de uso: login
  const login = async (email: string, password: string): Promise<User> => {
    setLoading(true);
    setError(null);
    try {
      const repo = new SupabaseAuthRepository();
      const loginUseCase = new LoginUseCase(repo);
      const user = await loginUseCase.execute(email, password);
      setUser(user);
      return user;
    } catch (err: any) {
      setError(err?.message ?? 'Error de inicio de sesión');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Caso de uso: registro
  const register = async (email: string, password: string, name: string, role: UserRole, extraData?: Partial<User>): Promise<User> => {
    setLoading(true);
    try {
      const repo = new SupabaseAuthRepository();
      const registerUseCase = new RegisterUseCase(repo);
      const newUser = await registerUseCase.execute(email, password, name, role, extraData);
      setUser(newUser);
      return newUser;
    } catch (err: any) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (data: Partial<User>) => {
    if (!user) return;
    setLoading(true);
    try {
      const repo = new SupabaseAuthRepository();
      const useCase = new UpdateProfileUseCase(repo);
      const updatedUser = await useCase.execute(user.id, data);
      setUser(updatedUser); // Actualizamos Zustand
    } catch (err: any) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<User> => {
    setLoading(true);
    setError(null);
    try {
      const repo = new SupabaseAuthRepository();
      const loginGoogleUseCase = new LoginWithGoogleUseCase(repo);
      
      const user = await loginGoogleUseCase.execute();
      setUser(user);
      return user;
    } catch (err: any) {
      setError(err?.message ?? 'Error con Google');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async (): Promise<void> => {
    try {
      const repo = new SupabaseAuthRepository();
      await repo.logout();
      setUser(null);
      setError(null);
    } catch (err) {
      setError((err as Error).message ?? 'Error al cerrar sesión');
      throw err;
    }
  };

  return { login, register,loginWithGoogle, logout,updateUserProfile };
};