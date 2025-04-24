import { ChatMember } from "../entities/chat/ChatMember";
import { ChatRoom } from "../entities/chat/ChatRoom";
import { Messages } from "../entities/chat/Messages";

export interface ChatRepository {
  createRoom(chatRoom: ChatRoom): Promise<ChatRoom>;
  getChatRooms(): Promise<ChatRoom[]>;
  getMessages(chatId: string): Promise<Messages[]>;
  getMembers(chatId: string): Promise<ChatMember[]>;
  createChatRoom(name: string, isGroup: boolean): Promise<ChatRoom>;
  sendMessage(
    chatId: string,
    senderId: string,
    content: string,
    messageType: string
  ): Promise<Messages>;
  addMember(chatId: string, userId: string): Promise<void>;
  removeMember(chatId: string, userId: string): Promise<void>;
  saveMessage(Messages: Messages): Promise<void>;
}
