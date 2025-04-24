import { ChatRoomMemberRepository } from "@/domain/repositories/chat/ChatRoomMemberRepository";
import { ChatMemberDto } from "./dto/ChatMemberDto";

export class ChatMemberUseCase {
  constructor(private chatMemberRepository: ChatRoomMemberRepository) {
    this.chatMemberRepository = chatMemberRepository;
  }
  async execute(chatMember: ChatMemberDto): Promise<ChatMemberDto> {
    // Call the repository to create the chat room
    console.log("chatMember : ", chatMember);
    const createdMember = await this.chatMemberRepository.addMember({
      userId: chatMember.userId,
      chatRoomId: chatMember.chatRoomId,
    } as ChatMemberDto);
    // Map the returned data to ChatRoomDto
    return createdMember;
  }
}
