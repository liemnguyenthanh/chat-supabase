import React from 'react';

interface MessageActionButtonProps {
  icon: string;
  label: string;
  onClick: () => void;
}

export const MessageActionButton: React.FC<MessageActionButtonProps> = ({
  icon,
  label,
  onClick,
}) => {
  return (
    <button
      className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 transition-colors"
      onClick={onClick}
    >
      <span className="text-lg">{icon}</span>
      <span className="text-sm text-gray-700">{label}</span>
    </button>
  );
};