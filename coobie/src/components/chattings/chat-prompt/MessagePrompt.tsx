import Image from "next/image";
import submitIcon from "../../../../public/images/message-submit-icon.svg";
import MyMessage from "./MyMessage";
import SenderMessage from "./SenderMessage";
import profileImg from "../../../../public/images/usr-profile-icon.jpeg";
import { createBrowserSupabaseClient } from "../../../../src/utils/supabase/client";
import { useRef, useState, useEffect } from "react";
type messageRoomProps = {
  messageRoomData: {
    id: string;
    name: string;
    isGroup: boolean;
    createdAt: string | Date; // ISO 문자열 또는 Date 타입 둘 다 가능하게
    userId: string;
  };
};
type ChatRoom = {
  id: string;
  name: string;
  isGroup: boolean;
  createdAt: string; // 또는 Date 타입을 사용할 수도 있습니다.
  userId: string;
};
const supabase = createBrowserSupabaseClient();

const sendMessage = async (
  chatRoomId: string,
  senderId: string,
  content: string
) => {
  try {
    const payload = {
      chatRoomId,
      senderId,
      content,
      messageType: "text", // 메시지 타입 (예: 텍스트)
      createdAt: new Date().toISOString(), // 메시지 생성 시간
    };

    const response = await fetch("/api/chattings/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("메시지 전송 실패");
    }

    const data = await response.json();
    console.log("메시지 전송 성공:", data);
    return data; // 서버에서 반환된 메시지 데이터
  } catch (error) {
    console.error("메시지 전송 중 오류 발생:", error);
  }
};

export default function MessagePrompt({ messageRoomData }: messageRoomProps) {
  const messageInputRef = useRef<HTMLInputElement>(null);
  const [messageData, setMessageData] = useState<
    {
      chatRoomId: string;
      senderId: string;
      content: string;
      messageType: string;
      createdAt: string;
    }[]
  >([]);

  // Request notification permission on component mount
  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission().then(permission => {
        console.log("Notification permission:", permission);
      });
    }
  }, []);

  const messageHandler = async () => {
    console.log("messageRoomData:", messageRoomData);

    // Extract newChatRoom from messageRoomData
    const { newChatRoom }: any = messageRoomData;

    // Validate newChatRoom and input content
    if (!newChatRoom?.id || !newChatRoom?.userId) {
      console.error("Invalid newChatRoom:", newChatRoom);
      return;
    }

    const content = messageInputRef.current?.value;
    if (!content) {
      console.error("Message content is empty");
      return;
    }

    try {
      const data = await sendMessage(
        newChatRoom.id,
        newChatRoom.userId,
        content
      );
      if (data) {
        // setMessageData(prev => [...prev, data]);
        console.log("Message added to state:", data);
      }
    } catch (error) {
      console.error("Error in messageHandler:", error);
    }
  };

  useEffect(() => {
    const { newChatRoom }: any = messageRoomData;

    if (!newChatRoom?.id) {
      console.error("Chat room ID is missing for real-time subscription");
      return;
    }

    console.log(
      "Setting up real-time subscription for chatRoomId:",
      newChatRoom.id
    );

    const channel = supabase
      .channel(`realtime:messages:${newChatRoom.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_room_id=eq.${newChatRoom.id}`,
        },
        payload => {
          console.log("New message received:", payload.new);
          const newMessage = {
            chatRoomId: payload.new.chat_room_id, // DB 컬럼 기준
            senderId: payload.new.sender_id,
            content: payload.new.content,
            messageType: payload.new.message_type,
            createdAt: payload.new.created_at, // 여기! created_at 써야함
          };
          setMessageData(prev => [...prev, newMessage]);
          // setMessageData(prev => [
          //   ...prev,
          //   payload.new as {
          //     chatRoomId: string;
          //     senderId: string;
          //     content: string;
          //     messageType: string;
          //     createdAt: string;
          //   },
          // ]);

          // Show a browser notification for the new message

          if (typeof Notification === "undefined") {
            console.error(
              "이 브라우저는 Notification API를 지원하지 않습니다."
            );
          } else {
            console.log(
              "현재 Notification.permission 상태:",
              Notification.permission
            );
            if (Notification.permission === "granted") {
              if (payload.new.sender_id == newChatRoom.userId) {
                try {
                  console.log("디버깅알림");
                  new Notification("새 메시지 도착", {
                    body: newMessage.content,
                    icon: "../../../../public/images/Coobie_icon.png",
                  });
                  console.log("알림이 성공적으로 표시되었습니다.");
                } catch (error) {
                  console.error("Notification 생성 중 오류 발생:", error);
                }
              }

              Notification.requestPermission().then(permission => {
                console.log("새로운 Notification.permission 상태:", permission);
                if (permission === "granted") {
                  console.log("알림 권한이 허용되었습니다.");
                } else {
                  console.log("알림 권한이 여전히 허용되지 않음.");
                }
              });
            }
          }
        }
      )
      .subscribe();

    // Cleanup function to remove the subscription
    return () => {
      supabase.removeChannel(channel);
      console.log(
        "Real-time subscription removed for chatRoomId:",
        newChatRoom.id
      );
    };
  }, [messageRoomData]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      messageHandler();
      if (messageInputRef.current) {
        messageInputRef.current.value = ""; // 입력창 초기화
      }
    }
  };

  return (
    <>
      <div className="p-[20px] flex flex-col gap-4 h-[380px] overflow-y-auto">
        {messageData.map((message, index) => (
          <div key={index}>
            {message.senderId === messageRoomData.userId ? (
              <MyMessage>
                <div className="text-[12px] text-[#8B8F93]">
                  {new Date(message.createdAt).toLocaleTimeString()}
                  {/* {messageData.map(item => item.createdAt)} */}
                </div>
                <div className="w-fit px-[10px] py-[6px] bg-[#ECBB60] rounded-tl-[20px] rounded-tr-none rounded-br-[20px] rounded-bl-[20px] text-[13px] font-light">
                  <p>{message.content}</p>
                </div>
              </MyMessage>
            ) : (
              <SenderMessage>
                <div className="flex gap-2">
                  <div className="flex items-start">
                    <Image
                      className="rounded-full"
                      src={profileImg}
                      width={45}
                      height={45}
                      alt="profile-img"
                    />
                  </div>
                  <div>
                    <div className="text-[13px]">{messageRoomData.name}</div>
                    <div className="bg-[#F7F7F7] w-fit px-[10px] py-[6px] rounded-tl-none rounded-tr-[20px] rounded-br-[20px] rounded-bl-[20px] text-[13px] font-light">
                      <p>{message.content}</p>
                    </div>
                  </div>
                </div>
                <div className="text-[12px] text-[#8B8F93]">
                  {new Date(message.createdAt).toLocaleTimeString()}
                  {/* {messageData.map(item => item.createdAt)} */}
                </div>
              </SenderMessage>
            )}
          </div>
        ))}
      </div>
      {/* 메세지 input */}
      <div className="border-t border-t-[#EEEFEF] relative w-[100%] pl-[10px] py-[15px]">
        <button
          className="absolute right-[5%] top-[33%]"
          onClick={messageHandler}
        >
          <Image
            src={submitIcon}
            width={46}
            height={36}
            alt="message-submit-icon"
          />
        </button>
        <div>
          <input
            className="bg-[#F8F8F9] pl-4 rounded-[14px] h-[55px] w-[98%] focus:outline-none"
            type="text"
            placeholder="메세지를 입력하세요."
            onKeyUp={onKeyDown}
            ref={messageInputRef}
          />
        </div>
      </div>
    </>
  );
}
