import { ChatRoomRepository } from "@/domain/repositories/chat/ChatRoomRepository";
import { ChatRoomDto } from "./dto/ChatRoomDto";
import { ChatRoom } from "@/domain/entities/chat/ChatRoom";
import { ChatMember } from "@/domain/entities/chat/ChatMember";
import { ChatRoomMemberRepository } from "@/domain/repositories/chat/ChatRoomMemberRepository";

export class ChatRoomUseCase {
  constructor(
    private chatRoomRepository: ChatRoomRepository,
    private chatRoomMemberRepository: ChatRoomMemberRepository
  ) {
    this.chatRoomRepository = chatRoomRepository;
    this.chatRoomMemberRepository = chatRoomMemberRepository;
  }
  async execute(
    chatRoomDto: ChatRoomDto,
    receiverId: string
  ): Promise<ChatRoom> {
    const chatRoom: ChatRoom = new ChatRoom();
    chatRoom.name = chatRoomDto.name;
    chatRoom.createdAt = new Date(chatRoomDto.createdAt);
    chatRoom.isGroup = chatRoomDto.isGroup;
    chatRoom.id = chatRoomDto.id;
    const newChatRoom = await this.chatRoomRepository.createRoom(
      chatRoom,
      receiverId
    );
    console.log("aa:", newChatRoom);
    if (!newChatRoom.id) {
      throw new Error("아이디가없음");
    }

    const userId = chatRoom.id;
    if (!userId) {
      throw new Error("User ID is undefined");
    }

    const chatMember = new ChatMember(newChatRoom.id, userId);
    await this.chatRoomMemberRepository.addMember(chatMember);
    return newChatRoom;
  }
}
