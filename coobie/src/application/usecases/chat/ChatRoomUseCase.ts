import { ChatRoomRepository } from "@/domain/repositories/chat/ChatRoomRepository";
import { ChatRoomDto } from "./dto/ChatRoomDto";
import { ChatRoom } from "@/domain/entities/chat/ChatRoom";
import { ChatMember } from "@/domain/entities/chat/ChatMember";
import { ChatRoomMemberRepository } from "@/domain/repositories/chat/ChatRoomMemberRepository";

export class ChatRoomUseCase {
  constructor(private chatRoomRepository: ChatRoomRepository) {
    this.chatRoomRepository = chatRoomRepository;
  }
  async execute(chatRoomDto: ChatRoomDto): Promise<ChatRoomDto> {
    // Call the repository to create the chat room
    const createdRoom = await this.chatRoomRepository.createRoom({
      userId: chatRoomDto.userId,
      name: chatRoomDto.name,
      isGroup: chatRoomDto.isGroup,
      createdAt: chatRoomDto.createdAt,
    } as ChatRoom);
    // Map the returned data to ChatRoomDto
    return createdRoom as ChatRoomDto;
  }
}
