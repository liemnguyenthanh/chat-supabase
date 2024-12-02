import React from 'react';
import { UserPlusIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline';

interface HeaderActionsProps {
  isOwner: boolean;
  onAddMember: () => void;
}

export const HeaderActions: React.FC<HeaderActionsProps> = ({ isOwner, onAddMember }) => {
  return (
    <div className="flex items-center gap-2">
      {isOwner && (
        <button
          onClick={onAddMember}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition"
          title="Add Member"
        >
          <UserPlusIcon className="w-5 h-5" />
        </button>
      )}
      <button
        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition"
        title="More Actions"
      >
        <EllipsisHorizontalIcon className="w-5 h-5" />
      </button>
    </div>
  );
};