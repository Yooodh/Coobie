import { ChatRoomUseCase } from "@/application/usecases/chat/ChatRoomUseCase";
import { ChatRoomDto } from "@/application/usecases/chat/dto/ChatRoomDto";
import { ChatRoomMemberRepository } from "@/domain/repositories/chat/ChatRoomMemberRepository";
import { ChatRoomRepository } from "@/domain/repositories/chat/ChatRoomRepository";
import { SbChatRoomRepository } from "@/infra/repositories/supabase/chat/SbChatRepository";
import { SbChatRoomMemberRepository } from "@/infra/repositories/supabase/chat/SbChatRoomMemberRepository";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log(body); // Log the request body for debugging

    const chatRoomData = {
      isGroup: body.isGroup,
      name: body.sender.name,
      createdAt: new Date().toISOString(),
    };

    console.log(
      chatRoomData.name,
      chatRoomData.isGroup,
      chatRoomData.createdAt
    );

    const chatRoom = new ChatRoomDto(
      chatRoomData.isGroup,
      chatRoomData.name,
      chatRoomData.createdAt,
      body.receiver.id // Pass the sender's user ID
    );

    const chatRoomMemberRepository: ChatRoomMemberRepository =
      new SbChatRoomMemberRepository();
    const chatRoomRepository: ChatRoomRepository = new SbChatRoomRepository();
    const chatUseCase = new ChatRoomUseCase(
      chatRoomRepository,
      chatRoomMemberRepository
    );

    // Pass receiver.id to createRoom
    const newChatRoom = await chatUseCase.execute(chatRoom, body.receiver.id);
    console.log("New Chat Room:", newChatRoom);

    if (!newChatRoom.id) {
      console.error("ID is missing in the response:", newChatRoom);
      throw new Error("아이디가없음");
    }

    return NextResponse.json(newChatRoom);
  } catch (error) {
    console.log(error);
    return NextResponse.error(); // Return an error response
  }
}
