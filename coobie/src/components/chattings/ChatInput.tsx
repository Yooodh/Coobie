"use client";
import { createClient } from "@supabase/supabase-js";
import { useEffect, useRef, useState } from "react";
import { DummyMessage } from "@/types/chat";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);
type ChatRoom = {
  ID: string;
  name: string;
  user_id: string;
};
type Message = {
  id: string;
  chatRoomId: string;
  content: string;
  createdAt: string; // ISO string format
  fileUrl: string | null;
  messageType: "text" | "file";
  senderId: string;
};

export default function ChatInput({ chatData }: { chatData: ChatRoom }) {
  const { ID, name, user_id } = chatData;
  console.log(chatData);
  console.log(ID, name);
  const messageInputRef = useRef<HTMLInputElement>(null);
  // const [messageData, setMessageData] = useState<Message[]>([]);
  const [messageData, setMessageData] = useState<DummyMessage[]>([]);
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      console.log("onKeyDown triggered"); // 디버깅 로그
      e.preventDefault();
      const message = messageInputRef.current?.value;
      console.log("Message:", message);

      // 메시지 전송 처리 예시
      if (message) {
        messageHandler();
        messageInputRef.current!.value = ""; // 입력창 초기화
      }
    }
  };
  const messageHandler = async () => {
    const payLoad = {
      senderId: user_id,
      chatRoomId: ID,
      senderName: name,
      senderMessage: messageInputRef.current?.value,
    };
    const messageData = await fetch("/api/chattings/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payLoad),
    });
    const data = await messageData.json();
    console.log(data);
    setMessageData(prev => [...prev, data]);
  };
  useEffect(() => {
    console.log(messageData);

    const channel = supabase.channel(`chat_room_members_channel_${user_id}`);
    channel
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_room_id=eq.${ID}`,
        },
        payload => {
          console.log("📥 새 메시지 수신됨:", payload.new);
          console.log(ID);
          // setMessageData(prev => {
          //   const isDuplicate = prev.some(
          //     msg => msg.chatRoomId === payload.new.chat_room_id
          //   );
          //   if (isDuplicate) return prev;
          //   return [...prev, payload.new as Message];
          // });
          setMessageData(prev => {
            const isDuplicate = prev.some(msg => msg.id === payload.new.id);
            if (isDuplicate) return prev;
            return [...prev, payload.new as DummyMessage];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      console.log("🧹 리스너 해제 완료");
    };
  }, [ID, user_id]); // Removed `messageData` from dependency array

  // Add dummy data for testing real-time chat functionality
  useEffect(() => {
    // Simulate receiving messages
    const dummyMessages = [
      {
        id: "1",
        chatRoomId: ID,
        content: "Hello! This is a test message.",
        createdAt: new Date().toISOString(),
        fileUrl: null,
        messageType: "text",
        senderId: "dummyUser1",
      },
      {
        id: "2",
        chatRoomId: ID,
        content: "Another test message.",
        createdAt: new Date().toISOString(),
        fileUrl: null,
        messageType: "text",
        senderId: "dummyUser2",
      },
    ];

    setMessageData(dummyMessages as DummyMessage[]);
  }, []);

  return (
    <>
      <div>
        <div className="flex flex-col w-[300px] mt-7">
          {`${chatData.name}님이 입장하셨습니다.`}
          <div className="bg-red-300 text-[#FFFFFF] h-[400px]">
            {messageData?.map(item => item.content)}
          </div>
          <input
            type="text"
            name=""
            id=""
            placeholder="메세지를 입력하세요."
            onKeyDown={onKeyDown}
            ref={messageInputRef}
          />
        </div>
        {/* 상대방 */}
        {/* <div className="flex flex-col w-[300px] mt-7">
          {`${chatData.name}님이 입장하셨습니다.`}
          <div className="bg-red-300 text-[#FFFFFF] h-[400px]">
            {messageData?.map(item => item.content)}
          </div>
          <input
            type="text"
            name=""
            id=""
            placeholder="메세지를 입력하세요."
            onKeyDown={onKeyDown}
            ref={messageInputRef}
          />
        </div> */}
      </div>
    </>
  );
}
