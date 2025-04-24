import { ChatMember } from "@/domain/entities/chat/ChatMember";
import { ChatRoom } from "@/domain/entities/chat/ChatRoom";
import { ChatRoomMemberRepository } from "@/domain/repositories/chat/ChatRoomMemberRepository";
import { createClient } from "@/utils/supabase/server";

export class SbChatRoomMemberRepository implements ChatRoomMemberRepository {
  async addMember(chatMember: ChatMember): Promise<ChatMember> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("chat_rooms_members")
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
