import React, { useState } from 'react';

interface CreateChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateChannel: (channelName: string) => void;
}

export const CreateChannelModal: React.FC<CreateChannelModalProps> = ({
  isOpen,
  onClose,
  onCreateChannel,
}) => {
  const [channelName, setChannelName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (channelName.trim()) {
      onCreateChannel(channelName.trim());
      setChannelName('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-4">Create New Channel</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
            placeholder="Channel name"
            className="w-full p-2 border rounded mb-4 focus:outline-none focus:border-blue-500"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}