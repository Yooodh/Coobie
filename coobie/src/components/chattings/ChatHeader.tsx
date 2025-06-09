import Image from "next/image";
import chatIcon from "../../../public/images/chat-icon.svg";
import chatBack from "../../../public/images/chat-back.svg";
interface ChatHeaderProps {
  mode: string;
  onRoomClick: () => void;
}

export default function ChatHeader({ mode, onRoomClick }: ChatHeaderProps) {
  return (
    <>
      <div className="flex items-center gap-3 h-[67px] bg-[#ECBB60] rounded-t-lg">
        {mode === "prompt" ? (
          <div
            onClick={onRoomClick}
            className="flex items-center justify-center w-[28px] h-[28px]"
          >
            <Image src={chatBack} alt="chat-back-icon" />
          </div>
        ) : (
          <div>
            <Image
              src={chatIcon}
              width={34}
              height={34}
              alt="chat-header-icon"
            />
          </div>
        )}
        <div>
          <span className="text-[#000000] font-semibold">coobie</span>
        </div>
      </div>
    </>
  );
}
