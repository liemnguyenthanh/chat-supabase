import React from 'react';
import { Channel } from '../types/chat';
import { formatDistanceToNow } from 'date-fns';

interface ChannelListProps {
  channels: Channel[];
  activeChannel: string;
  onChannelSelect: (channelId: string) => void;
  onCreateChannelClick: () => void;
}

export const ChannelList: React.FC<ChannelListProps> = ({
  channels,
  activeChannel,
  onChannelSelect,
  onCreateChannelClick,
}) => {
  return (
    <div className="w-64 bg-gray-800 text-white p-4 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Channels</h2>
        <button
          onClick={onCreateChannelClick}
          className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm"
        >
          +
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {channels.map((channel) => (
          <div
            key={channel.id}
            onClick={() => onChannelSelect(channel.id)}
            className={`cursor-pointer p-2 rounded mb-1 ${
              activeChannel === channel.id
                ? 'bg-gray-600'
                : 'hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              {channel.avatarUrl && (
                <img
                  src={channel.avatarUrl}
                  alt={channel.title}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <span className="font-medium truncate"># {channel.title}</span>
                  {channel.unreadCount > 0 && (
                    <span className="bg-blue-500 text-xs px-2 py-1 rounded-full">
                      {channel.unreadCount}
                    </span>
                  )}
                </div>
                {channel.lastMessage && (
                  <p className="text-sm text-gray-400 truncate">
                    {channel.lastMessage}
                  </p>
                )}
                {channel.lastMessageAt && (
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(channel.lastMessageAt), { addSuffix: true })}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};