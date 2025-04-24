import { ReactNode } from "react";

type UserListCardProps = {
  children: ReactNode;
};

export default function UserListCard({ children }: UserListCardProps) {
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">{children}</div>
        <button className="cursor-pointer">채팅하기</button>
      </div>
    </>
  );
}
