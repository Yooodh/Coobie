"use client";
import React, { useEffect, useState } from "react";

export default function page() {
  const myProfile = {
    id: "1",
    name: "coobie",
  };
  const selectedUsers = [
    { id: "2", name: "likeLion" },
    { id: "3", name: "junY" },
  ];
  // const payload = {
  //   creator: myProfile, // 방장
  //   members: [myProfile, ...selectedUsers], // 전체 참여자 (본인 + 초대한 유저들)
  //   name: selectedUsers.map(user => user.name).join(", "), // 방 이름
  //   isGroup: true,
  //   createdAt: new Date().toISOString(),
  // };
  const [user, setUser] = useState({
    id: "",
    name: "",
  });
  const [userDate, setUserData] = useState("");
  const [invite, setInvite] = useState({});
  const userSelect = ({ id, userName }: { id: string; userName: string }) => {
    console.log(id, userName);
    setUser({
      id: id,
      name: userName,
    });
    console.log(user);
  };
  useEffect(() => {
    console.log(user);
  }, [user]);
  const createChatRoom = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload = {
      sender: myProfile, // 나
      receiver: user, // 상대방
      isGroup: false,
    };
    const response = await fetch("/api/chat/room", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
  };

  return (
    <>
      <form onSubmit={createChatRoom}>
        <button className="bg-amber-800 text-[#ffffff] rounded-2xl">
          채팅방생성
        </button>
        <button className="bg-red-500 text-[#ffffff]">초대하기</button>
        <div>채팅방이름: {user.name}</div>
        <div>채팅방 생성:{userDate}</div>
        <div>채팅맴버:{}</div>
        <div>
          {selectedUsers.map(item => {
            return (
              <div>
                {`ID :${item.id} / name:${item.name}`}
                <button
                  onClick={() => setUser({ id: item.id, name: item.name })}
                >
                  채팅하기
                </button>
              </div>
            );
          })}
        </div>
      </form>
    </>
  );
}
