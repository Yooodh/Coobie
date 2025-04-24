import { ChatMessageUseCase } from "@/application/usecases/chat/ChatMessageUseCase";
import { ChatRoomUseCase } from "@/application/usecases/chat/ChatRoomUseCase";
import { ChatRoomDto } from "@/application/usecases/chat/dto/ChatRoomDto";
import { ChatRoomRepository } from "@/domain/repositories/chat/ChatRoomRepository";
import { SbChatRoomRepository } from "@/infra/repositories/supabase/chat/SbChatRepository";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const data = await request.json();
  console.log("GET data:", data);
  const roomName = data.name;
  const roomId = data.id;
  const chatRoomDto = new ChatRoomDto(
    roomId,
    roomName,
    false,
    new Date().toISOString()

    // roomId
  );
  console.log(chatRoomDto);
  const chatRoomRepository: ChatRoomRepository = new SbChatRoomRepository();
  const createRoomUseCase = new ChatRoomUseCase(chatRoomRepository);
  const newChatRoom = await createRoomUseCase.execute(chatRoomDto);
  console.log("newChatRoom11", newChatRoom);
  return NextResponse.json({
    newChatRoom,
  });
}
