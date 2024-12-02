import React, { useState } from 'react';
import { AddMemberModal } from './AddMemberModal';
import { HeaderActions } from './HeaderActions';

interface ChatRoomHeaderProps {
  channelTitle: string;
  channelId: string;
  isOwner: boolean;
}

export const ChatRoomHeader: React.FC<ChatRoomHeaderProps> = ({
  channelTitle,
  channelId,
  isOwner,
}) => {
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);

  return (
    <div className="bg-white shadow-sm p-4 border-b flex justify-between items-center">
      <h1 className="text-xl font-semibold">{channelTitle || 'Loading...'}</h1>

      <div className="flex items-center gap-4">
        <HeaderActions
          isOwner={isOwner}
          onAddMember={() => setIsAddMemberModalOpen(true)}
        />
      </div>

      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        channelId={channelId}
      />
    </div>
  );
};