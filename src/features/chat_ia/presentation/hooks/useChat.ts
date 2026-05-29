import { useChatStore } from '../store/chatStore';
import { GeminiChatRepository } from '../../infrastructure/repositories/GeminiChatRepository';
import { SendMessageUseCase } from '../../application/use-cases/SendMessageUseCase';

export const useChat = () => {
  const { messages, isLoading, error } = useChatStore();
  const addMessage = useChatStore((state) => state.addMessage);
  const setLoading = useChatStore((state) => state.setLoading);
  const setError = useChatStore((state) => state.setError);

  const sendMessage = async (text: string) => {
    console.log("A. Hook useChat disparado con el texto:", text);
    setLoading(true);
    setError(null);
    
    const userMessage = { id: Date.now().toString(), text, role: 'user' as const, timestamp: new Date() };
    addMessage(userMessage);

    try {
      const repo = new GeminiChatRepository();
      const useCase = new SendMessageUseCase(repo);
      
      const responseText = await useCase.execute(text, messages);
      console.log("B. Hook useChat recibió la respuesta:", responseText);
      
      addMessage({
        id: (Date.now() + 1).toString(),
        text: responseText,
        role: 'model',
        timestamp: new Date()
      });

    } catch (err: any) {
      console.error("❌ ERROR ATRAPADO EN EL HOOK:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { messages, isLoading, error, sendMessage };
};