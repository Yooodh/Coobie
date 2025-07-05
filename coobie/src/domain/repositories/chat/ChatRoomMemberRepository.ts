import { ChatMember } from "@/domain/entities/chat/ChatMember";

export interface ChatRoomMemberRepository {
  chatRoomFindAll(userId: string): Promise<string[]>;
  addMember(chatRoomId: string, userId: string): Promise<ChatMember>;
}
