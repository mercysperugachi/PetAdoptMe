export interface ChatMessage {
  id: string;
  text: string;
  role: 'user' | 'model'; // 'user' eres tú, 'model' es Gemini
  timestamp: Date;
}