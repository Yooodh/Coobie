import { ChatRoom } from "@/domain/entities/chat/ChatRoom";
import { ChatRoomRepository } from "@/domain/repositories/chat/ChatRoomRepository";
import { createClient } from "@/utils/supabase/server";

export class SbChatRoomRepository implements ChatRoomRepository {
  async createRoom(chatRoom: ChatRoom): Promise<ChatRoom> {
    const supabase = await createClient();

    const { data: existingMember, error: fetchError } = await supabase
      .from("chat_rooms")
      .select("*")
      .eq("user_id", chatRoom.userId)
      .eq("name", chatRoom.name)
      .maybeSingle(); // Use maybeSingle to handle no rows found gracefully

    if (fetchError) {
      throw new Error(fetchError.message);
    }

    // if (existingMember) {
    //   throw new Error("Member already exists in the chat room.");
    // }
    // Insert into chat_rooms table
    const { data: chatRoomData, error: chatRoomError } = await supabase
      .from("chat_rooms")
      .insert({
        user_id: chatRoom.userId,
        is_group: chatRoom.isGroup,
        name: chatRoom.name,
        created_at: chatRoom.createdAt,
      })
      .select()
      .maybeSingle(); // Use maybeSingle to handle cases where no rows are found gracefully

    return {
      ...chatRoomData,
    } as ChatRoom;
  }
}
