import React from 'react';

interface SearchUserListProps {
  users: Array<{
    id: string;
    username: string;
    avatarUrl: string;
  }>;
  onAddUser: (userId: string) => void;
  actionLabel: string;
}

export const SearchUserList: React.FC<SearchUserListProps> = ({ 
  users, 
  onAddUser,
  actionLabel 
}) => {
  if (users.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        No users found
      </div>
    );
  }

  return (
    <div className="max-h-64 overflow-y-auto">
      {users.map((user) => (
        <div
          key={user.id}
          className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
        >
          <div className="flex items-center gap-2">
            <img
              src={user.avatarUrl}
              alt={user.username}
              className="w-8 h-8 rounded-full"
            />
            <span className="font-medium">{user.username}</span>
          </div>
          <button
            onClick={() => onAddUser(user.id)}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {actionLabel}
          </button>
        </div>
      ))}
    </div>
  );
};