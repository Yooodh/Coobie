import Image from "next/image";
import submitIcon from "../../../../public/images/message-submit-icon.svg";
import MyMessage from "./MyMessage";
import SenderMessage from "./SenderMessage";
import profileImg from "../../../../public/images/usr-profile-icon.jpeg";
export default function MessagePrompt() {
  return (
    <>
      <div className="p-[20px] flex flex-col gap-4">
        <MyMessage>
          <div className="text-[12px] text-[#8B8F93]">{`${new Date().getHours()}:${new Date().getMinutes()}`}</div>
          <div className="w-fit px-[10px] py-[6px] bg-[#ECBB60] rounded-tl-[20px] rounded-tr-none rounded-br-[20px] rounded-bl-[20px] text-[13px] font-light">
            <p>Your message content goes here.</p>
          </div>
        </MyMessage>
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
              <div className="text-[13px]">data.name</div>
              <div className="bg-[#F7F7F7] w-fit px-[10px] py-[6px] rounded-tl-none rounded-tr-[20px] rounded-br-[20px] rounded-bl-[20px] text-[13px] font-light">
                <p>Sender message content goes here.</p>
              </div>
            </div>
          </div>
          <div className="text-[12px] text-[#8B8F93]">{`${new Date().getHours()}:${new Date().getMinutes()}`}</div>
        </SenderMessage>
      </div>
      {/* 메세지 input */}
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
