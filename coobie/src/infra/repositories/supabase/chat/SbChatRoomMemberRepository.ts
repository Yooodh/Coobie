import { ChatMember } from "@/domain/entities/chat/ChatMember";
import { ChatRoom } from "@/domain/entities/chat/ChatRoom";
import { ChatRoomMemberRepository } from "@/domain/repositories/chat/ChatRoomMemberRepository";
import { createClient } from "@/utils/supabase/server";

export class SbChatRoomMemberRepository implements ChatRoomMemberRepository {
  async addMember(chatMember: ChatMember): Promise<ChatMember> {
    const supabase = await createClient();
    // 1. 채팅방 존재 여부 확인
    const { data: existingRoom } = await supabase
      .from("chat_rooms")
      .select("*")
      .eq("ID", chatMember.chatRoomId)
      .eq("user_id", chatMember.userId)
      .maybeSingle();
    console.log(existingRoom);
    // ✅ 채팅방이 없으면 예외 처리
    if (!existingRoom) {
      throw new Error("채팅방이 존재하지 않습니다.");
    }

    // 2. 중복 멤버 확인
    const { data: existingMember, error: fetchError } = await supabase
      .from("chat_room_members")
      .select("*")
      .eq("user_id", chatMember.userId)
      .eq("chat_room_id", chatMember.chatRoomId)
      .maybeSingle();

    if (fetchError) {
      throw new Error(fetchError.message);
    }

    if (existingMember) {
      // 이미 존재하면 그냥 반환
      return existingMember as ChatMember;
    }

    // 3. 없으면 insert
    const { data, error } = await supabase
      .from("chat_room_members")
      .insert({
        user_id: chatMember.userId,
        chat_room_id: chatMember.chatRoomId,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      ...data,
      user_id: chatMember.userId,
      chat_room_id: chatMember.chatRoomId,
    } as ChatMember;
  }
}
