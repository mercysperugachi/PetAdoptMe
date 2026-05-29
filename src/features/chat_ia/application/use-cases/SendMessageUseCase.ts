import { IChatRepository } from '../../domain/interfaces/IChatRepository';
import { ChatMessage } from '../../domain/entities/ChatMessage';

export class SendMessageUseCase {
  constructor(private readonly chatRepository: IChatRepository) {}

  async execute(message: string, history: ChatMessage[]): Promise<string> {
    if (!message.trim()) throw new Error("El mensaje no puede estar vacío");
    return this.chatRepository.sendMessage(message, history);
  }
}