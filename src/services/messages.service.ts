import { supabase } from '../lib/supabase';
import { Message } from '../types/chat';

export const messagesService = {
  async getChannelMessages(channelId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        id,
        content,
        user_id,
        channel_id,
        type,
        metadata,
        reply_to_id,
        created_at,
        is_edited,
        is_deleted,
        users (
          username,
          avatar_url
        ),
        message_reactions (
          emoji,
          users (
            username
          )
        ),
        message_attachments (
          id,
          file_url,
          file_type,
          file_name
        )
      `)
      .eq('channel_id', channelId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error('Failed to fetch messages');
    }

    return data.map(msg => ({
      id: msg.id,
      content: msg.content,
      userId: msg.user_id,
      username: msg.users?.[0].username,
      avatarUrl: msg.users?.[0].avatar_url,
      channelId: msg.channel_id,
      type: msg.type,
      metadata: msg.metadata,
      replyToId: msg.reply_to_id,
      createdAt: msg.created_at,
      isEdited: msg.is_edited,
      isDeleted: msg.is_deleted,
      reactions: msg.message_reactions?.map(reaction => ({
        emoji: reaction.emoji,
        users: reaction.users.map(u => u.username)
      })) || [],
      attachments: msg.message_attachments?.map(attachment => ({
        id: attachment.id,
        fileUrl: attachment.file_url,
        fileType: attachment.file_type,
        fileName: attachment.file_name
      })) || []
    }));
  },

  async sendMessage(channelId: string, userId: string, content: string, type: 'text' | 'custom' | 'attachment' | 'reply' = 'text', metadata = {}, replyToId?: string): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .insert([
        {
          content,
          channel_id: channelId,
          user_id: userId,
          type,
          metadata,
          reply_to_id: replyToId
        }
      ]);

    if (error) {
      throw new Error('Failed to send message');
    }
  },

  async addReaction(messageId: string, userId: string, emoji: string): Promise<void> {
    const { error } = await supabase
      .from('message_reactions')
      .insert([
        {
          message_id: messageId,
          user_id: userId,
          emoji
        }
      ]);

    if (error && error.code !== '23505') { // Ignore unique violation
      throw new Error('Failed to add reaction');
    }
  },

  async removeReaction(messageId: string, userId: string, emoji: string): Promise<void> {
    const { error } = await supabase
      .from('message_reactions')
      .delete()
      .match({
        message_id: messageId,
        user_id: userId,
        emoji
      });

    if (error) {
      throw new Error('Failed to remove reaction');
    }
  }
};