import Image from "next/image";
import chatIcon from "../../../public/images/chat-icon.svg";
export default function ChatHeader() {
  return (
    <>
      <div className="flex items-center gap-3 h-[67px] bg-[#ECBB60] rounded-t-lg">
        <Image src={chatIcon} width={34} height={34} alt="chat-header-icon" />
        <div>
          <span className="text-[#000000] font-semibold">coobie</span>
        </div>
      </div>
    </>
  );
}
