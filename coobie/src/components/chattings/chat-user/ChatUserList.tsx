import Image from "next/image";
import UserListCard from "./UserListCard";
import profileImg from "../../../../public/images/usr-profile-icon.jpeg";
import { UserDto } from "@/application/usecases/user/dto/UserDto";
//user정보 fetch request,response
interface UserCardProps {
  user: UserDto;
  onPromptClick: (id: string, name: string) => Promise<void>;
}
type UserProps = {
  userData: {
    id: string;
    name: string;
    departmentName: string;
    positionName: string;
    nikname: string;
  }[];
};
export default function ChatUserList({ user, onPromptClick }: UserCardProps) {
  console.log("user", user);
  return (
    <>
      <div className="w-[100%] h-[80px] p-5">
        {/* listCard */}
        <div className="flex flex-col gap-4">
          {
            <UserListCard
              key={user.id}
              user={user}
              onPromptClick={(id: string, name: string) =>
                onPromptClick(id, name)
              }
            >
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
                <span className="text-[14px] font-semibold">
                  {user.nickname}
                </span>
                <div className="flex gap-1 text-[#abaaaa]">
                  <span className="text-[12px] font-medium">
                    {user.departmentName}
                  </span>
                  <span className="text-[12px] font-medium">
                    {user.positionName}
                  </span>
                </div>
              </div>
            </UserListCard>
          }
        </div>
      </div>
    </>
  );
}
