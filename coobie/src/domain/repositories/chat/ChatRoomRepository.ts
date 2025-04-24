import { ChatRoom } from "@/domain/entities/chat/ChatRoom";

export interface ChatRoomRepository {
  createRoom(chatRoom: ChatRoom): Promise<ChatRoom>;
}
