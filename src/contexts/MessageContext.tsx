import { createContext, useCallback, useContext, useReducer } from 'react';
import React from 'react';
import { ReactionType } from '../constants/reaction';
import { Message } from '../types/chat';
import { messagesService } from '../services/messages.service';
import { useAuthContext } from './AuthContext';
import toast from 'react-hot-toast';

interface MessageState {
  messages: Message[];
  replyingTo: Message | null;
  reactions: Record<string, ReactionType[]>;
  loading: boolean;
  error: string | null;
}

interface MessageContextType {
  messages: Message[];
  replyingTo: Message | null;
  reactions: Record<string, ReactionType[]>;
  loading: boolean;
  error: string | null;
  actions: {
    sendMessage: (content: string, channelId: string) => Promise<void>;
    editMessage: (messageId: string, content: string) => Promise<void>;
    deleteMessage: (messageId: string) => Promise<void>;
    setReplyingTo: (message: Message | null) => void;
    addReaction: (messageId: string, reaction: ReactionType) => Promise<void>;
    removeReaction: (messageId: string, reactionId: string) => Promise<void>;
  };
}

type MessageAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_MESSAGES'; payload: Message[] }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'UPDATE_MESSAGE'; payload: Message }
  | { type: 'DELETE_MESSAGE'; payload: string }
  | { type: 'SET_REPLYING_TO'; payload: Message | null }
  | { type: 'SET_REACTIONS'; payload: { messageId: string; reactions: ReactionType[] } }
  | { type: 'ADD_REACTION'; payload: { messageId: string; reaction: ReactionType } }
  | { type: 'REMOVE_REACTION'; payload: { messageId: string; reactionId: string } };

export const initialState: MessageState = {
  messages: [],
  replyingTo: null,
  reactions: {},
  loading: false,
  error: null,
};

export function messageReducer(state: MessageState, action: MessageAction): MessageState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'UPDATE_MESSAGE':
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload.id ? action.payload : msg
        ),
      };
    case 'DELETE_MESSAGE':
      return {
        ...state,
        messages: state.messages.filter(msg => msg.id !== action.payload),
      };
    case 'SET_REPLYING_TO':
      return { ...state, replyingTo: action.payload };
    case 'SET_REACTIONS':
      return {
        ...state,
        reactions: {
          ...state.reactions,
          [action.payload.messageId]: action.payload.reactions,
        },
      };
    case 'ADD_REACTION':
      return {
        ...state,
        reactions: {
          ...state.reactions,
          [action.payload.messageId]: [
            ...(state.reactions[action.payload.messageId] || []),
            action.payload.reaction,
          ],
        },
      };
    case 'REMOVE_REACTION':
      return {
        ...state,
        reactions: {
          ...state.reactions,
          [action.payload.messageId]: state.reactions[action.payload.messageId]?.filter(
            reaction => reaction !== action.payload.reactionId
          ) || [],
        },
      };
    default:
      return state;
  }
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);


const useMessageActions = (): MessageContextType => {
  const [state, dispatch] = useReducer(messageReducer, initialState);
  const { user } = useAuthContext()

  const sendMessage = useCallback(async (content: string, channelId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // dispatch({ type: 'ADD_MESSAGE', payload: Message });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to send message' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const editMessage = async (message: string) => { }
  const deleteMessage = async (message: string) => { }

  const setReplyingTo = useCallback((message: Message | null) => {
    dispatch({ type: 'SET_REPLYING_TO', payload: message });
  }, []);

  const addReaction = useCallback(async (messageId: string, reaction: ReactionType) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      toast.success(`Reaction: ${messageId}, user`);
      messagesService.addReaction(messageId, user.id, reaction)
      dispatch({
        type: 'ADD_REACTION',
        payload: { messageId, reaction },
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add reaction' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const removeReaction = useCallback(async (messageId: string, reactionId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // const { error } = await supabase
      //   .from('message_reactions')
      //   .delete()
      //   .eq('id', reactionId);

      // if (error) throw error;

      dispatch({
        type: 'REMOVE_REACTION',
        payload: { messageId, reactionId },
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to remove reaction' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  return {
    ...state,
    actions: {
      sendMessage,
      editMessage,
      deleteMessage,
      setReplyingTo,
      addReaction,
      removeReaction,
    },
  };
};

interface MessageProviderProps {
  children: React.ReactNode;
}

export const MessageProvider: React.FC<MessageProviderProps> = ({ children }) => {
  const messageContext = useMessageActions();

  return (
    <MessageContext.Provider value={messageContext}>
      {children}
    </MessageContext.Provider>
  );
};

export const useMessageContext = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessageContext must be used within a MessageProvider');
  }
  return context;
};
