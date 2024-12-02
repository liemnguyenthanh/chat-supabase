import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Message, Channel } from '../types/chat';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ChannelList } from './ChannelList';
import { CreateChannelModal } from './CreateChannelModal';
import { ChatRoomHeader } from './header/ChatRoomHeader';
import { channelsService } from '../services/channels.service';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

interface ChatRoomProps {
  onLogout: () => void;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({ onLogout }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeChannelData = channels.find((c) => c.id === activeChannel);
  console.log({ activeChannelData });

  useEffect(() => {
    if (user) {
      fetchChannels();
      const channelSubscription = supabase
        .channel('public:channels')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'channels' },
          () => {
            fetchChannels();
          }
        )
        .subscribe();

      return () => {
        channelSubscription.unsubscribe();
      };
    }
  }, [user]);

  useEffect(() => {
    if (activeChannel && user) {
      fetchMessages();
      channelsService.updateLastRead(activeChannel, user.id);

      const messageSubscription = supabase
        .channel('public:messages')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages' },
          async (payload) => {
            const newMessage = payload.new as any;

            // Fetch user details for the new message
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('username, avatar_url')
              .eq('id', newMessage.user_id)
              .single();

            if (userError) {
              console.error('Failed to fetch user details for new message');
              return;
            }

            // Format the message to match our Message type
            const formattedMessage: Message = {
              id: newMessage.id,
              content: newMessage.content,
              userId: newMessage.user_id,
              channelId: newMessage.channel_id,
              type: newMessage.type || 'text',
              createdAt: newMessage.created_at,
              isEdited: newMessage.is_edited || false,
              isDeleted: newMessage.is_deleted || false,
              username: userData.username,
              avatarUrl: userData.avatar_url,
            };

            if (formattedMessage.channelId === activeChannel) {
              setMessages((prev) => [...prev, formattedMessage]);
              channelsService.updateLastRead(activeChannel, user.id);
            } else {
              fetchChannels(); // Update unread counts for other channels
            }
          }
        )
        .subscribe();

      return () => {
        messageSubscription.unsubscribe();
      };
    }
  }, [activeChannel, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChannels = async () => {
    if (!user) return;

    try {
      const userChannels = await channelsService.getUserChannels(user.id);
      setChannels(userChannels);
      if (userChannels.length > 0 && !activeChannel) {
        setActiveChannel(userChannels[0].id);
      }
    } catch (error) {
      toast.error('Failed to fetch channels');
    }
  };

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select(
        `
        id,
        content,
        user_id,
        channel_id,
        type,
        created_at,
        is_edited,
        is_deleted,
        users (
          username,
          avatar_url
        )
      `
      )
      .eq('channel_id', activeChannel)
      .order('created_at', { ascending: true });

    if (error) {
      toast.error('Failed to fetch messages');
      return;
    }

    const formattedMessages = data.map((msg) => ({
      id: msg.id,
      content: msg.content,
      userId: msg.user_id,
      username: msg.users.username,
      avatarUrl: msg.users.avatar_url,
      channelId: msg.channel_id,
      type: msg.type,
      createdAt: msg.created_at,
      isEdited: msg.is_edited,
      isDeleted: msg.is_deleted,
    }));

    setMessages(formattedMessages);
  };

  const handleCreateChannel = async (title: string) => {
    if (!user) return;

    try {
      await channelsService.createChannel(user.id, title);
      toast.success('Channel created successfully');
      setIsCreateModalOpen(false);
    } catch (error) {
      toast.error('Failed to create channel');
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!activeChannel || !user) return;

    const { error } = await supabase.from('messages').insert([
      {
        content,
        channel_id: activeChannel,
        user_id: user.id,
        type: 'text',
      },
    ]);

    if (error) {
      toast.error('Failed to send message');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex h-screen">
      <ChannelList
        channels={channels}
        activeChannel={activeChannel}
        onChannelSelect={setActiveChannel}
        onCreateChannelClick={() => setIsCreateModalOpen(true)}
      />

      <div className="flex-1 flex flex-col">
        <ChatRoomHeader
          channelTitle={activeChannelData?.title || ''}
          channelId={activeChannel}
          isOwner={activeChannelData?.isOwner || false}
          onLogout={onLogout}
        />

        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              isOwnMessage={message.userId === user?.id}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        <ChatInput onSendMessage={handleSendMessage} />
      </div>

      <CreateChannelModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateChannel={handleCreateChannel}
      />
    </div>
  );
};
