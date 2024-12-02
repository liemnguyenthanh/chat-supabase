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
  }
};