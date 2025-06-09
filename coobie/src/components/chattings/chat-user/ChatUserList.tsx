import Image from "next/image";
import UserListCard from "./UserListCard";
import profileImg from "../../../../public/images/usr-profile-icon.jpeg";
//user정보 fetch request,response
export default function ChatUserList() {
  return (
    <>
      <div className="w-[100%] h-[450px] overflow-auto p-5">
        {/* listCard */}
        <div className="flex flex-col gap-4">
          {Array(10)
            .fill(0)
            .map(item => {
              return (
                <>
                  <UserListCard>
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
                  </UserListCard>
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
