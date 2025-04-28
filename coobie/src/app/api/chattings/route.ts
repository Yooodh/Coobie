import { ChatMessageUseCase } from "@/application/usecases/chat/ChatMessageUseCase";
import { ChatRoomUseCase } from "@/application/usecases/chat/ChatRoomUseCase";
import { ChatRoomDto } from "@/application/usecases/chat/dto/ChatRoomDto";
import { ChatRoomRepository } from "@/domain/repositories/chat/ChatRoomRepository";
import { SbChatRoomRepository } from "@/infra/repositories/supabase/chat/SbChatRepository";
import { ChatRoomMemberRepository } from "@/domain/repositories/chat/ChatRoomMemberRepository";
import { SbChatRoomMemberRepository } from "@/infra/repositories/supabase/chat/SbChatRoomMemberRepository";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const data = await request.json();
  console.log("GET data:", data);
  const { roomData, myId, roomId } = data; // 참여자 ID 추가
  const roomName = roomData;
  const userId = myId;
  const participantId = roomId;
  console.log("participantId", participantId);
  // 1. 채팅방 생성
  const chatRoomDto = new ChatRoomDto(
    userId,
    roomName,
    false,
    new Date().toISOString()
  );
  const chatRoomRepository: ChatRoomRepository = new SbChatRoomRepository();
  const createRoomUseCase = new ChatRoomUseCase(chatRoomRepository);
  const newChatRoom = await createRoomUseCase.execute(chatRoomDto);
  console.log("newChatRoom", newChatRoom);

  const chatRoomId = newChatRoom.id; // 생성된 채팅방 ID
  const chatRoomMembersRepository: ChatRoomMemberRepository =
    new SbChatRoomMemberRepository();

  await chatRoomMembersRepository.addMember(chatRoomId as string, userId);

  // 참여자 추가
  await chatRoomMembersRepository.addMember(
    chatRoomId as string,
    participantId
  );

  return NextResponse.json({
    newChatRoom,
  });
}

// export async function GET() {
//   // 데이터베이스에서 사용자가 참여 중인 채팅방 목록 조회
//   const chatRooms = await fetchChatRoomsFromDB(); // 예시 함수
//   return NextResponse.json(chatRooms);
//   const;
// }

// async function fetchChatRoomsFromDB() {
//   // 데이터베이스 로직 구현
//   return [
//     { id: "room1", name: "Chat Room 1", isGroup: false, userId: "user1" },
//     { id: "room2", name: "Chat Room 2", isGroup: true, userId: "user2" },
//   ];
// }
