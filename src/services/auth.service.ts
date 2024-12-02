import { supabase } from '../lib/supabase';
import { AuthUser, LoginCredentials, RegisterCredentials } from '../types/auth';
import { getGravatarUrl } from '../utils/gravatar';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('username', credentials.username)
      .single();

    if (fetchError) {
      throw new Error('User not found');
    }

    return {
      id: existingUser.id,
      username: existingUser.username,
      avatarUrl: existingUser.avatar_url
    };
  },

  async register(credentials: RegisterCredentials): Promise<AuthUser> {
    const avatarUrl = getGravatarUrl(credentials.username);

    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([
        {
          username: credentials.username,
          avatar_url: avatarUrl
        }
      ])
      .select()
      .single();

    if (createError) {
      if (createError.code === '23505') { // Unique violation
        throw new Error('Username already taken');
      }
      throw new Error('Failed to create user');
    }

    return {
      id: newUser.id,
      username: newUser.username,
      avatarUrl: newUser.avatar_url
    };
  }
};