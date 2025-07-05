import { ReactNode } from "react";

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
export default function RoomListCard({
  // user,
  // onPromptClick,
  children,
}: any) {
  return (
    <>
      <div
        // onClick={() => onPromptClick({ id: user.id, name: user.name })}
        className="flex gap-2"
      >
        {children}
      </div>
    </>
  );
}
