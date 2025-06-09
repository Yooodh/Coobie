import Image from "next/image";
import submitIcon from "../../../../public/images/message-submit-icon.svg";
export default function MessageInput() {
  return (
    <>
      <div className="border-t border-t-[#EEEFEF] relative w-[100%] pl-[10px] pt-[15px]">
        <button className="absolute right-[5%] top-[33%]">
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
          />
        </div>
      </div>
    </>
  );
}
