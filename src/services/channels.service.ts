import { supabase } from '../lib/supabase';
import { Channel } from '../types/chat';
import { getGravatarUrl } from '../utils/gravatar';

export const channelsService = {
  async createChannel(
    userId: string,
    title: string,
    avatarUrl?: string
  ): Promise<Channel> {
    // Start a transaction
    const { data: channel, error: channelError } = await supabase
      .from('channels')
      .insert([
        {
          title,
          avatar_url: avatarUrl,
          is_private: false,
        },
      ])
      .select()
      .single();

    if (channelError) {
      throw new Error('Failed to create channel');
    }

    // Add creator as channel owner
    const { error: memberError } = await supabase
      .from('channel_members')
      .insert([
        {
          channel_id: channel.id,
          user_id: userId,
          role: 'owner',
          last_read_at: new Date().toISOString(),
        },
      ]);

    if (memberError) {
      throw new Error('Failed to set channel ownership');
    }

    return channel;
  },

  async addChannelMember(channelId: string, userId: string): Promise<void> {
    const { error } = await supabase.from('channel_members').insert([
      {
        channel_id: channelId,
        user_id: userId,
        role: 'member',
        last_read_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      throw new Error('Failed to add channel member');
    }
  },

  async filterNonMembers(
    channelId: string,
    users: Array<{ id: string, username: string; avatarUrl: string; }>
  ): Promise<Array<{ id: string, username: string; avatarUrl: string; }>> {
    const { data: members, error } = await supabase
      .from('channel_members')
      .select('user_id')
      .eq('channel_id', channelId);

    if (error) {
      throw new Error('Failed to fetch channel members');
    }

    const memberIds = new Set(members.map((m) => m.user_id));
    return users.filter((user) => !memberIds.has(user.id));
  },

  async getUserChannels(userId: string): Promise<Channel[]> {
    const { data, error } = await supabase.rpc(
      'get_user_channels_with_latest_messages',
      {
        p_user_id: userId,
      }
    );
    if (error) {
      throw new Error('Failed to fetch channels');
    }

    return data.map((channel) => ({
      id: channel.channel_id,
      title: channel.channel_title,
      avatarUrl: channel.channel_avatar_url || getGravatarUrl(channel.channel_id),
      lastMessage: channel.last_message_content,
      lastMessageAt: channel.last_message_created_at,
      unreadCount: Number(channel.unread_count),
      isOwner: channel.role === 'owner',
    }));
  },

  async updateLastRead(channelId: string, userId: string): Promise<void> {
    const { error } = await supabase.rpc('update_channel_last_read', {
      p_channel_id: channelId,
      p_user_id: userId,
    });

    if (error) {
      throw new Error('Failed to update last read timestamp');
    }
  },
};
