// src/features/auth/infrastructure/repositories/SupabaseAuthRepository.ts

import { IAuthRepository } from '../../domain/interfaces/IAuthRepository';
import { User, UserRole } from '../../domain/entities/User';
import { supabase } from '../../../../core/config/supabase';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import * as QueryParams from 'expo-auth-session/build/QueryParams';

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

  async registerWithEmail(email: string, password: string, name: string, role: UserRole, extraData?: Partial<User>): Promise<User> {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role } }
    });

    if (signUpError) throw signUpError;
    const user = signUpData?.user;
    if (!user?.id) throw new Error('Registro fallido');

    // El trigger crea el perfil base, ahora le añadimos los campos extra si es refugio
    if (extraData && Object.keys(extraData).length > 0) {
      await supabase.from('profiles').update({
        document_id: extraData.document_id,
        phone: extraData.phone,
        address: extraData.address,
        latitude: extraData.latitude,   // 🔥 Añadimos esto
        longitude: extraData.longitude  // 🔥 Añadimos esto
      }).eq('id', user.id);
    }

    return {
      id: user.id, email, name, role,
      createdAt: new Date().toISOString(),
      ...extraData
    };
  }



  async loginWithGoogle(): Promise<User> {
    const redirectUrl = AuthSession.makeRedirectUri();
      
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true,
      },
    });

    if (error) throw error;
    if (!data.url) throw new Error("No se pudo obtener la URL de Google.");

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

    if (result.type === "success") {
      const { url } = result;
      const { params, errorCode } = QueryParams.getQueryParams(url);
        
      if (errorCode) throw new Error(errorCode);

      let authUser;

      // Intercambiar credenciales por sesión
      if (params.access_token && params.refresh_token) {
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: params.access_token,
          refresh_token: params.refresh_token,
        });
        if (sessionError) throw sessionError;
        authUser = sessionData.user;
      } else if (params.code) {
        const { data: sessionData, error: codeError } = await supabase.auth.exchangeCodeForSession(params.code);
        if (codeError) throw codeError;
        authUser = sessionData.user;
      } else {
        throw new Error("Google no mandó credenciales en la URL.");
      }

      if (!authUser?.id) throw new Error('Error al obtener usuario de Google');

      // Sincronizar con la tabla perfiles (profiles)
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();
      
      if (fetchError) throw fetchError;

      // Si es primera vez que entra con Google, le creamos su perfil como 'adoptante' por defecto
      if (!profile) {
        const { error: insertError } = await supabase.from('profiles').insert({
          id: authUser.id,
          email: authUser.email,
          name: authUser.user_metadata?.full_name ?? authUser.email ?? 'Usuario',
          role: 'adoptante',
        });
        
        if (insertError) throw insertError;

        return {
          id: authUser.id,
          email: authUser.email ?? '',
          name: authUser.user_metadata?.full_name ?? authUser.email ?? 'Usuario',
          role: 'adoptante',
          createdAt: new Date().toISOString(),
        };
      }

      // Si ya existía, retornamos sus datos
      return {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role as UserRole,
        createdAt: profile.created_at,
      };

    } else {
      throw new Error(`Login cancelado: ${result.type}`);
    }
  }


  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    const { data: profile, error } = await supabase
      .from('profiles')
      .update({
        name: data.name,
        document_id: data.document_id,
        phone: data.phone,
        address: data.address,
        occupation: data.occupation,
        experience: data.experience,
        home_description: data.home_description,
        latitude: data.latitude,   // 🔥 Asegura esta línea
        longitude: data.longitude, // 🔥 Asegura esta línea
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    return {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role as UserRole,
      createdAt: profile.created_at,
      document_id: profile.document_id,
      phone: profile.phone,
      address: profile.address,
      occupation: profile.occupation,
      experience: profile.experience,
      home_description: profile.home_description,
      latitude: profile.latitude,   // 🔥 Asegura esta línea
      longitude: profile.longitude, // 🔥 Asegura esta línea
    };
  }

  
}


export default SupabaseAuthRepository;