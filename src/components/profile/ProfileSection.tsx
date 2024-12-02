import React, { useState } from 'react';
import { UpdateProfileModal } from './UpdateProfileModal';
import { AuthUser } from '../../types/auth';

interface ProfileSectionProps {
  user: AuthUser;
  onLogout: () => void;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({ user, onLogout }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="bg-gray-900 p-4">
      <div 
        className="flex items-center gap-3 mb-4 cursor-pointer hover:bg-gray-800 p-2 rounded-lg transition-colors"
        onClick={() => setIsModalOpen(true)}
      >
        <img
          src={user.avatarUrl}
          alt={user.username}
          className="w-10 h-10 rounded-full"
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-medium truncate">{user.username}</h3>
          <p className="text-gray-400 text-sm">Click to edit profile</p>
        </div>
      </div>
      
      <button
        onClick={onLogout}
        className="w-full px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors text-left"
      >
        Logout
      </button>

      <UpdateProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={user}
      />
    </div>
  );
}