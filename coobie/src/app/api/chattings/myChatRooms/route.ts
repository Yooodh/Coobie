import { ChatRoomMemberRepository } from "@/domain/repositories/chat/ChatRoomMemberRepository";
import { SbChatRoomMemberRepository } from "@/infra/repositories/supabase/chat/SbChatRoomMemberRepository";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const data = await request.json();
  const { userId } = data;
  const chatRoomMembersRepository: ChatRoomMemberRepository =
    new SbChatRoomMemberRepository();
  const myChatRooms = await chatRoomMembersRepository.chatRoomFindAll(userId);
  console.log("myChatRooms:", myChatRooms);
  console.log("myRooms", data);
  return NextResponse.json({ myChatRooms });
}
