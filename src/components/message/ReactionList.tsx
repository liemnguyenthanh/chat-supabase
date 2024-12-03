import React from 'react';
import { REACTIONS, ReactionType } from '../../constants/reaction';

interface ReactionListProps {
    onSelect: (reaction: ReactionType) => void;
}

export const ReactionList: React.FC<ReactionListProps> = ({ onSelect }) => {
    return (
        <div className="grid grid-cols-4 gap-1 p-2 bg-white">
            {REACTIONS.map(({ emoji, name }) => (
                <button
                    key={name}
                    onClick={() => onSelect(name)}
                    className="p-2 hover:bg-gray-100 rounded transition-colors text-xl"
                    title={name.replace('_', ' ')}
                >
                    {emoji}
                </button>
            ))}
        </div>
    );
};