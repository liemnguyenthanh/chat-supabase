import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Message } from '../types/chat';

interface ChatMessageProps {
  message: Message;
  isOwnMessage: boolean;
  onReactionAdd?: (emoji: string) => void;
  onReactionRemove?: (emoji: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isOwnMessage,
  onReactionAdd,
  onReactionRemove
}) => {
  const renderContent = () => {
    switch (message.type) {
      case 'text':
        return <p className="mt-1">{message.content}</p>;
      case 'attachment':
        return (
          <div className="mt-1">
            {message.attachments?.map(attachment => (
              <a
                key={attachment.id}
                href={attachment.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline block"
              >
                📎 {attachment.fileName}
              </a>
            ))}
          </div>
        );
      case 'reply':
        return (
          <div className="mt-1">
            <div className="border-l-2 border-gray-300 pl-2 mb-1 text-sm text-gray-500">
              {message.metadata?.repliedContent}
            </div>
            <p>{message.content}</p>
          </div>
        );
      default:
        return <p className="mt-1">{message.content}</p>;
    }
  };

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className="flex items-start gap-2 max-w-[70%]">
        <img
          src={message.avatarUrl}
          alt={message.username}
          className="w-8 h-8 rounded-full"
        />
        <div
          className={`rounded-lg px-4 py-2 ${
            isOwnMessage ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-sm">
              {isOwnMessage ? 'You' : message.username}
            </span>
            <span className="text-xs opacity-70">
              {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
            </span>
            {message.isEdited && (
              <span className="text-xs opacity-70">(edited)</span>
            )}
          </div>
          {renderContent()}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {message.reactions.map(reaction => (
                <button
                  key={reaction.emoji}
                  onClick={() => {
                    const hasReacted = reaction.users.includes(message.username);
                    if (hasReacted) {
                      onReactionRemove?.(reaction.emoji);
                    } else {
                      onReactionAdd?.(reaction.emoji);
                    }
                  }}
                  className={`text-sm px-2 py-1 rounded-full ${
                    reaction.users.includes(message.username)
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {reaction.emoji} {reaction.users.length}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};