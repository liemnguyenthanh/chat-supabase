export interface Message {
  id: string;
  content: string;
  userId: string;
  username: string;
  createdAt: string;
  channelId: string;
  avatarUrl: string;
  type: 'text' | 'custom' | 'attachment' | 'reply';
  metadata?: Record<string, any>;
  replyToId?: string;
  isEdited: boolean;
  isDeleted: boolean;
  reactions?: MessageReaction[];
  attachments?: MessageAttachment[];
}

export interface Channel {
  id: string;
  title: string;
  avatarUrl?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  isOwner?: boolean;
}

export interface MessageReaction {
  emoji: string;
  users: string[];
}

export interface MessageAttachment {
  id: string;
  fileUrl: string;
  fileType: string;
  fileName: string;
}

export interface DatabaseMessage {
  id: string;
  content: string;
  user_id: string;
  channel_id: string;
  type: string;
  created_at: string;
  is_edited: boolean;
  is_deleted: boolean;
  users: {
    username: string | null;
    avatar_url: string | null;
  };
}
