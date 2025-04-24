"use client";
import chatHome from "../../../public/images/chat-home.svg";
import Image from "next/image";
import ChatHeader from "./ChatHeader";
import ChatFooter from "./ChatFooter";
import ChatRoomList from "./chat-room/ChatRoomList";
import ChatUserList from "./chat-user/ChatUserList";
import MessagePrompt from "./chat-prompt/MessagePrompt";
import { useState } from "react";

export default function Chatting() {
  const [mode, setMode] = useState(true);
  const currentHandler = () => {
    console.log("실행");
    setMode(!mode);
  };
  return (
    <>
      <div className="w-[400px]  shadow-md rounded-b-lg">
        <ChatHeader />
        {mode ? <ChatUserList /> : <ChatRoomList />}
        <ChatFooter currentHandler={currentHandler} />
        {/* <MessagePrompt /> */}
      </div>
      <div className="flex items-center justify-center rounded-full border border-[#61441E] w-[65px] h-[65px]">
        {/* 채팅 활성화 아이콘 */}
        <Image src={chatHome} width={50} height={50} alt="chatting-icon" />
      </div>
    </>
  );
}
