"use client";
import { UserDto } from "@/application/usecases/user/dto/UserDto";
import { ReactNode } from "react";
interface UserCardProps {
  user: UserDto;
  onPromptClick: (id: string, name: string) => Promise<void>;
  children: ReactNode;
}
type UserProps = {
  user: {
    id: string;
    name: string;
    departmentName: string;
    positionName: string;
  };
  onPromptClick: (userData: { id: string; name: string }) => void;
  children: ReactNode;
};

export default function UserListCard({
  user,
  onPromptClick,
  children,
}: UserCardProps) {
  return (
    <>
      <form action="">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">{children}</div>
          <button
            type="button"
            onClick={() => onPromptClick(user.id, user.nickname)}
            className="cursor-pointer"
          >
            채팅하기
          </button>
        </div>
      </form>
    </>
  );
}
