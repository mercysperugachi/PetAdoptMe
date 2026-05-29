import { GoogleGenerativeAI } from '@google/generative-ai';
import { IChatRepository } from '../../domain/interfaces/IChatRepository';
import { ChatMessage } from '../../domain/entities/ChatMessage';

const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export class GeminiChatRepository implements IChatRepository {
  async sendMessage(message: string, history: ChatMessage[]): Promise<string> {
    if (!apiKey) throw new Error("Falta la API Key de Gemini en el archivo .env");

    try {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        systemInstruction: "Eres un veterinario experto y un asistente virtual amable de una aplicación de adopción llamada PetAdopt. Tu trabajo es dar consejos de salud, nutrición y comportamiento para mascotas de forma concisa y amigable."
      });

      // Mapeamos el historial al formato estricto de Gemini
      const formattedHistory = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }],
      }));

      // 🔴 AQUÍ ESTÁ LA MAGIA QUE SOLUCIONA EL ERROR:
      // Si el primer mensaje del historial es nuestro saludo predeterminado de la UI ('model'),
      // lo eliminamos para que Gemini no se enoje.
      if (formattedHistory.length > 0 && formattedHistory[0].role === 'model') {
        formattedHistory.shift(); 
      }

      const chatSession = model.startChat({ history: formattedHistory });
      const result = await chatSession.sendMessage(message);
      
      return result.response.text();
    } catch (error) {
      console.error("❌ ERROR CRÍTICO EN GEMINI API:", error);
      throw error;
    }
  }
}