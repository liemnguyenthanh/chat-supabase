import React from 'react';
import { MessageActionButton } from './MessageActionButton';
import { ReactionList } from './ReactionList';
import { useMessageContext } from '../../contexts';
import { Message } from '../../types/chat';
import { ReactionType } from '../../constants/reaction';
import toast from 'react-hot-toast';

interface MessageActionPopupProps {
  message: Message;
  position: { x: number; y: number };
  onClose: () => void;
}

export const MessageActionPopup: React.FC<MessageActionPopupProps> = ({
  message,
  position,
  onClose,
}) => {
  const { actions } = useMessageContext()

  const handleReply = () => { }

  const handleReaction = (reaction: ReactionType) => {
    toast.success(`Reaction: ${reaction}`);

    actions.addReaction(message.id, reaction)
  }

  return (
    <div
      className="fixed bg-white rounded-lg shadow-lg border border-gray-200 p2 z-50 "
      style={{
        top: position.y,
        left: position.x,
        minWidth: '160px',
        overflow: 'hidden'
      }}
    >
      <ReactionList onSelect={handleReaction} />

      <MessageActionButton
        icon="💬"
        label="Reply"
        onClick={() => {
          handleReply();
          onClose();
        }}
      />
    </div>
  );
};