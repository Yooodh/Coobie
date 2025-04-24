import Image from "next/image";
import chatIcon from "../../../public/images/chat-icon.svg";
import chatHome from "../../../public/images/chat-home.svg";
type currentHandlerProps = {
  currentHandler: () => void;
};
export default function ChatFooter({ currentHandler }: currentHandlerProps) {
  return (
    <>
      <div className="border-t border-t-[#EEEFEF] flex items-center justify-between gap-10 mt-4 pt-2 pb-2 pl-20 pr-20">
        <button
          onClick={currentHandler}
          className="cursor-pointer flex flex-col items-center"
        >
          <Image src={chatHome} width={28} height={28} alt="chat-home" />
          <span className="text-[16px] font-medium">홈</span>
        </button>
        <button
          onClick={currentHandler}
          className="cursor-pointer flex flex-col items-center gap-1"
        >
          <Image src={chatIcon} width={28} height={28} alt="chatting-icon" />
          <span className="text-[16px] font-medium">대화</span>
        </button>
      </div>
    </>
  );
}
