import { ChatRoomMemberRepository } from "@/domain/repositories/chat/ChatRoomMemberRepository";
import { ChatMemberDto } from "./dto/ChatMemberDto";

export class ChatMemberUseCase {
  constructor(private chatMemberRepository: ChatRoomMemberRepository) {
    this.chatMemberRepository = chatMemberRepository;
  }
  async findRoomMember(myId: string) {
    console.log(myId);
    const myChatRoom = await this.chatMemberRepository.chatRoomFindAll(myId);
    return myChatRoom;
  }
  async execute(chatMember: ChatMemberDto): Promise<ChatMemberDto> {
    // Call the repository to create the chat room
    console.log("chatMember : ", chatMember);
    const createdMember = await this.chatMemberRepository.addMember(
      chatMember.chatRoomId,
      chatMember.userId
    );
    // Map the returned data to ChatRoomDto
    return createdMember;
  }
}
