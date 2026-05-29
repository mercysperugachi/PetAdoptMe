import { create } from 'zustand';
import { ChatMessage } from '../../domain/entities/ChatMessage';

type ChatState = {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  addMessage: (msg: ChatMessage) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
};

export const useChatStore = create<ChatState>((set) => ({
  // Empezamos con un mensaje de bienvenida del bot
  messages: [{
    id: 'welcome',
    text: '¡Hola! Soy el asistente veterinario de PetAdopt. ¿En qué puedo ayudarte hoy?',
    role: 'model',
    timestamp: new Date()
  }],
  isLoading: false,
  error: null,
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));