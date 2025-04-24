import { Messages } from "@/domain/entities/chat/Messages";

export interface ChatMessagesRepository {
  save(message: Messages): Promise<Messages>;
  listenForNewMessages(callback: (message: Messages) => void): void;
}
