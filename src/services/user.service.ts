import { supabase } from '../lib/supabase';

export const userService = {
  async searchUsers(query: string) {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, avatar_url')
      .ilike('username', `%${query}%`)
      .limit(10);

    if (error) {
      throw new Error('Failed to search users');
    }

    return data.map(user => ({
      id: user.id,
      username: user.username,
      avatarUrl: user.avatar_url
    }));
  },

  async updateProfile(userId: string, updates: { username?: string }) {
    const { error } = await supabase
      .from('users')
      .update({
        username: updates.username,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      if (error.code === '23505') {
        throw new Error('Username already taken');
      }
      throw new Error('Failed to update profile');
    }
  }
};