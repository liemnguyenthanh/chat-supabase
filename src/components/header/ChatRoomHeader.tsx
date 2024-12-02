import React, { useState } from 'react';
import { AddMemberModal } from './AddMemberModal';
import { HeaderActions } from './HeaderActions';

interface ChatRoomHeaderProps {
  channelTitle: string;
  channelId: string;
  isOwner: boolean;
  onLogout: () => void;
}

export const ChatRoomHeader: React.FC<ChatRoomHeaderProps> = ({
  channelTitle,
  channelId,
  isOwner,
  onLogout,
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
        <button
          onClick={onLogout}
          className="px-4 py-2 text-sm text-red-600 hover:text-red-800"
        >
          Logout
        </button>
      </div>

      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        channelId={channelId}
      />
    </div>
  );
};