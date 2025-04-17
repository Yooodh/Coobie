import { ChatRoom } from "@/domain/entities/chat/ChatRoom";
import { ChatRoomRepository } from "@/domain/repositories/chat/ChatRoomRepository";
import { createClient } from "@/utils/supabase/server";

export class SbChatRoomRepository implements ChatRoomRepository {
  async createRoom(chatRoom: ChatRoom, receiverId: string): Promise<ChatRoom> {
    const supabase = await createClient();

    if (!receiverId) {
      throw new Error(
        "receiverId is null or undefined. Cannot insert into chat_room_members."
      );
    }

    console.log("Receiver ID:", receiverId); // Debugging log

    // Insert into chat_rooms table
    const { data: chatRoomData, error: chatRoomError } = await supabase
      .from("chat_rooms")
      .insert({
        is_group: chatRoom.isGroup,
        name: chatRoom.name,
        created_at: chatRoom.createdAt,
      })
      .select()
      .single();

    if (chatRoomError) {
      throw new Error(chatRoomError.message);
    }

    // Insert into chat_room_members table using the generated chat_room_id and receiver.id
    const { error: chatRoomMemberError } = await supabase
      .from("chat_room_members")
      .insert({
        chat_room_id: chatRoomData.id, // Use the generated ID from chat_rooms
        user_id: receiverId, // Use receiver.id as user_id
      });

    if (chatRoomMemberError) {
      throw new Error(chatRoomMemberError.message);
    }

    return {
      ...chatRoomData,
      name: chatRoomData.name,
      isGroup: chatRoomData.isGroup,
      createdAt: chatRoomData.createdAt,
    } as ChatRoom;
  }
}
