import { ReactNode } from "react";

type RoomListCard = {
  children: ReactNode;
};

export default function RoomListCard({ children }: RoomListCard) {
  return (
    <>
      <div className="flex gap-2">{children}</div>
    </>
  );
}
