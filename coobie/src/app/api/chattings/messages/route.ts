import { ChatMessageDto } from "@/application/usecases/chat/dto/ChatMessageDto";
import { ChatMessageUseCase } from "@/application/usecases/chat/ChatMessageUseCase";
import { NextResponse } from "next/server";
import { SbchatMessagesRepository } from "@/infra/repositories/supabase/chat/SbchatMessagesRepository";
import { ChatMessagesRepository } from "@/domain/repositories/chat/ChatMessagesRepository";
import { ChatMemberUseCase } from "@/application/usecases/chat/ChatMemberUseCase";
import { SbChatRoomMemberRepository } from "@/infra/repositories/supabase/chat/SbChatRoomMemberRepository";
import { ChatMemberDto } from "@/application/usecases/chat/dto/ChatMemberDto";
import { ChatRoomMemberRepository } from "@/domain/repositories/chat/ChatRoomMemberRepository";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log("messagePayLoad : ", data);
    console.log("roomID : ", data.chatRoomId);
    //유저아이디(PK)
    const chatMessageDto: ChatMessageDto = new ChatMessageDto(
      data.senderId,
      data.chatRoomId,
      data.senderMessage,
      "text", // Assuming messageType is "text"
      new Date(),
      ""
    );
    console.log(chatMessageDto);
    const chatMessageRepository: ChatMessagesRepository =
      new SbchatMessagesRepository(
        chatMessageDto.senderId,
        chatMessageDto.chatRoomId
      );
    console.log("디버깅1");
    const chatMessageUseCase = new ChatMessageUseCase(chatMessageRepository);
    //유저 아이디(PK), 채팅방아이디(PK)
    //채팅룸맴버 생성
    const chatMember = new ChatMemberDto(
      chatMessageDto.senderId,
      chatMessageDto.chatRoomId
    );
    //유저 아이디(PK), 채팅방아이디(PK)
    const chatMemberRepository: ChatRoomMemberRepository =
      new SbChatRoomMemberRepository();

    const chatMemberUseCase = new ChatMemberUseCase(chatMemberRepository);
    console.log("chatMember : ", chatMember.chatRoomId, chatMember.userId);
    chatMemberUseCase.execute(chatMember);
    chatMessageUseCase.listenForNewMessages(message => {
      console.log("새로운 메시지 수신:", message);
    });
    console.log("디버깅2");
    const savedMessage = await chatMessageUseCase.sendMessage(chatMessageDto);
    console.log("save : ", savedMessage);
    return NextResponse.json(savedMessage);
  } catch (error) {
    console.error("🔥 POST API Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
