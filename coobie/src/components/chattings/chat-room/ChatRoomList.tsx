import Image from "next/image";
import RoomListCard from "./RoomListCard";
import profileImg from "../../../../public/images/usr-profile-icon.jpeg";

//채팅 송수신 데이터 fetch request,response
//채팅룸 데이터(name)들어와야함
//메세지 데이터created,content) 들어와야함.
type UserProps = {
  userData: {
    id: string;
    name: string;
    departmentName: string;
    positionName: string;
  }[];
  onPromptClick: (id: string, name: string) => Promise<void>;
};
// { userData, onPromptClick }: UserProps props
export default function ChatRoomList() {
  return (
    <>
      <div className="w-full h-[450px] overflow-auto p-5">
        {/* listCard */}
        <div className="flex flex-col gap-4 w-full">
          {Array(10)
            .fill(0)
            .map(item => {
              return (
                <>
                  <RoomListCard
                  // user={user}
                  // onPromptClick={({ id, name }) => onPromptClick(id, name)}
                  >
                    <div className="min-w-[50px] min-h-[50px]">
                      <Image
                        className="rounded-full"
                        src={profileImg}
                        width={50}
                        height={50}
                        alt="profile-img"
                      />
                    </div>
                    <div className="flex flex-col justify-between w-full">
                      <div className="flex justify-between">
                        <span>Data.name</span>
                        <span>{`${new Date().getHours()}시${new Date().getMinutes()}분`}</span>
                      </div>
                      <div>
                        <span>message.content</span>
                      </div>
                    </div>
                  </RoomListCard>
                </>
              );
            })}
          {/* <UserListCard>
            <div>
              <Image
                className="rounded-full"
                src={profileImg}
                width={50}
                height={50}
                alt="profile-img"
              />
            </div>
            <div>
              <span>Data.name</span>
              <div>
                <span>Data.department</span>
                <span>Data.position</span>
              </div>
            </div>
          </UserListCard> */}
        </div>
      </div>
    </>
  );
}
