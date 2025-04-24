import { ChatMember } from "@/domain/entities/chat/ChatMember";

export interface ChatRoomMemberRepository {
  addMember(member: ChatMember): Promise<ChatMember>;
}
