export const REACTIONS = [
    { emoji: '👍', name: 'thumbs_up' },
    { emoji: '❤️', name: 'heart' },
    { emoji: '😄', name: 'smile' },
    { emoji: '😮', name: 'wow' },
    { emoji: '😢', name: 'sad' },
    { emoji: '😡', name: 'angry' },
    { emoji: '🎉', name: 'party' },
    { emoji: '🚀', name: 'rocket' },
  ] as const;
  
  export type ReactionType = typeof REACTIONS[number]['name'];