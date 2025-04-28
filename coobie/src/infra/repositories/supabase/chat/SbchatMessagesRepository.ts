import { Messages } from "@/domain/entities/chat/Messages";
import { createServerSupabaseClient } from "@/utils/supabase/server";

export class SbchatMessagesRepository {
  constructor(public sender_id: string, public chat_room_id: string) {}
  async save(message: Messages): Promise<Messages> {
    const supabase = await createServerSupabaseClient();

    // Insert into chat_messages table
    const { data: messageData, error: messageError } = await supabase
      .from("messages")
      .insert({
        chat_room_id: this.chat_room_id,
        sender_id: this.sender_id,
        content: message.content,
        message_type: message.messageType,
        created_at: message.createdAt?.toISOString(),
      })
      .select()
      .single();
    console.log("sb : ", {
      chat_room_id: this.chat_room_id,
      sender_id: this.sender_id,
      content: message.content,
      message_type: message.messageType,
      created_at: message.createdAt?.toISOString(),
    });
    console.log("Supabase Error:", messageError);

    if (messageError) {
      console.error("Supabase Insert Error:", messageError);
      throw new Error(
        `Error saving message: ${
          messageError.message ?? JSON.stringify(messageError)
        }`
      );
    }

    return {
      ...messageData,
    } as Messages;
  }
  async listenForNewMessages(
    callback: (message: Messages) => void
  ): Promise<void> {
    const supabase = await createServerSupabaseClient();

    const channel = supabase
      .channel(`messages:chat_room_id=eq.${this.chat_room_id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_room_id=eq.${this.chat_room_id}`,
        },
        payload => {
          const message = payload.new;
          const isDuplicate = false; // Add logic to check for duplicates if needed
          if (!isDuplicate) {
            callback(
              new Messages(
                message.chat_room_id,
                message.sender_id,
                message.content,
                message.message_type,
                message.created_at,
                message.file_url,
                message.id
              )
            );
          }
        }
      );

    await channel.subscribe();
  }
}
