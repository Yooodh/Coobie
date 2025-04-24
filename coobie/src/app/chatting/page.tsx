"use client";
import MessageInput from "@/components/chattings/chat-prompt/MessageInput";
import ChatFooter from "@/components/chattings/ChatFooter";
import ChatHeader from "@/components/chattings/ChatHeader";
import ChatInput from "@/components/chattings/ChatInput";
import Chatting from "@/components/chattings/Chatting";
import React, { useEffect, useRef, useState } from "react";

export default function page() {
  // const roomData = [
  //   {
  //     id: "user002",
  //     name: "유대현",
  //   },
  //   {
  //     id: "user03",
  //     name: "윤준영",
  //   },
  // ];
  // const [user, setUser] = useState({
  //   id: "",
  //   name: "",
  // });
  // type ChatRoom = {
  //   ID: string;
  //   name: string;
  //   user_id: string;
  // };

  // const messageInputRef = useRef<HTMLInputElement>(null);
  // const [chatData, setChatData] = useState<ChatRoom | null>(null);
  // const [userMessage, setUserMessage] = useState<string | undefined>();

  // const createChatRoom = async (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   console.log(user);
  //   const response = await fetch("/api/chattings", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify(user),
  //   });
  //   const data = await response.json();
  //   const { newChatRoom } = data;
  //   setChatData(newChatRoom);
  //   console.log("data", chatData);
  // };
  // useEffect(() => {
  //   console.log("chatData", chatData);
  // }, [chatData]);
  // useEffect(() => {
  //   console.log(user);
  // }, [user]);
  return (
    <>
      <Chatting />

      {/* <form onSubmit={createChatRoom}>
        <div>
          {roomData.map(item => {
            return (
              <div>
                {`ID :${item.id} / name:${item.name}`}
                <button
                  onClick={() => setUser({ id: item.id, name: item.name })}
                >
                  채팅하기
                </button>
              </div>
            );
          })}
        </div>
      </form>
      <div>
        <div>채팅방이름 :{chatData?.name}</div>
      </div>
      <div className="flex gap-3">
        {chatData && <ChatInput chatData={chatData} />}
      </div> */}
    </>
  );
}
