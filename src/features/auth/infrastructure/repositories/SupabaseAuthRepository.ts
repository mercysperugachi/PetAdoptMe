// src/features/auth/infrastructure/repositories/SupabaseAuthRepository.ts

import { IAuthRepository } from '../../domain/interfaces/IAuthRepository';
import { User, UserRole } from '../../domain/entities/User';
import { supabase } from '../../../../core/config/supabase';

export class SupabaseAuthRepository implements IAuthRepository {
  async loginWithEmail(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) throw error;
    const userId = data?.user?.id;
    if (!userId) throw new Error('Usuario no encontrado');

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;
    if (!profile) throw new Error('Perfil no encontrado');

    const user: User = {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role as UserRole,
      createdAt: profile.created_at,
    };

    return user;
  }

  async registerWithEmail(email: string, password: string, name: string, role: UserRole): Promise<User> {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });

    if (signUpError) throw signUpError;
    const user = signUpData?.user;
    if (!user?.id) throw new Error('Registro fallido');

    const { error: insertError } = await supabase.from('profiles').insert({
      id: user.id,
      email,
      name,
      role,
      created_at: new Date().toISOString(),
    });

    if (insertError) throw insertError;

    const createdUser: User = {
      id: user.id,
      email,
      name,
      role,
      createdAt: new Date().toISOString(),
    };

    return createdUser;
  }

  async loginWithGoogle(): Promise<User> {
    const { data: oauthData, error: oauthError } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (oauthError) throw oauthError;

    // Try to obtain user directly from oauth response, otherwise fetch current user after OAuth flow
    let oauthUser = (oauthData as any)?.user;
    if (!oauthUser) {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      oauthUser = (userData as any)?.user;
    }

    if (!oauthUser?.id) throw new Error('Google sign-in failed');

    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', oauthUser.id)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (!profile) {
      const { error: insertError } = await supabase.from('profiles').insert({
        id: oauthUser.id,
        email: oauthUser.email,
        name: oauthUser.user_name ?? oauthUser.email ?? 'Usuario',
        role: 'adoptante',
        created_at: new Date().toISOString(),
      });

      if (insertError) throw insertError;

      return {
        id: oauthUser.id,
        email: oauthUser.email ?? '',
        name: oauthUser.user_name ?? oauthUser.email ?? 'Usuario',
        role: 'adoptante',
        createdAt: new Date().toISOString(),
      };
    }

    const user: User = {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role as UserRole,
      createdAt: profile.created_at,
    };

    return user;
  }

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
}

export default SupabaseAuthRepository;