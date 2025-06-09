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
    console.log("content : ", data.content); // 디버깅 로그 추가

    // Ensure content is passed correctly
    const chatMessageDto: ChatMessageDto = new ChatMessageDto(
      data.senderId,
      data.chatRoomId,
      data.content, // Pass content explicitly
      data.messageType || "text", // Default to "text" if not provided
      new Date(data.createdAt),
      data.fileUrl || "" // Default to empty string if not provided
    );

    console.log("ChatMessageDto : ", chatMessageDto); // 디버깅 로그 추가

    const chatMessageRepository: ChatMessagesRepository =
      new SbchatMessagesRepository(
        chatMessageDto.senderId,
        chatMessageDto.chatRoomId
      );

    const chatMessageUseCase = new ChatMessageUseCase(chatMessageRepository);

    const savedMessage = await chatMessageUseCase.sendMessage(chatMessageDto);
    console.log("save : ", savedMessage);
    return NextResponse.json(savedMessage);
  } catch (error) {
    console.error("🔥 POST API Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
