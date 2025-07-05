"use client";
import chatHome from "../../../public/images/chat-home.svg";
import Image from "next/image";
import ChatHeader from "./ChatHeader";
import ChatFooter from "./ChatFooter";
import ChatRoomList from "./chat-room/ChatRoomList";
import ChatUserList from "./chat-user/ChatUserList";
import MessagePrompt from "./chat-prompt/MessagePrompt";
import { useMappedUsers } from "@/presentation/hooks/useMappedUsers";
import { useState, useRef, useEffect, useCallback } from "react";
import { UserDto } from "@/application/usecases/user/dto/UserDto";
import { DepartmentDto, PositionDto } from "@/application/usecases/dto";
type UserProp = {
  id: string;
  name: string;
  departmentName: string;
  positionName: string;
}[];

export default function Chatting() {
  const [mode, setMode] = useState<"user" | "room" | "prompt">("user");
  const [userData, setUserData] = useState<UserProp>();
  const handleUserSelect = () => setMode("user");
  const [messageRoomData, setMessageRoomData] = useState();

  // 유저 추가
  const [currentUser, setCurrentUser] = useState<UserDto | null>(null);
  const [users, setUsers] = useState<UserDto[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserDto[]>([]);
  //

  //userId === userId가 맞으면 넘겨주기.
  // const handlePromptClick = () => setMode("prompt");
  const handlePromptClick = async (id: string, name: string) => {
    console.log("onPromptClick", id, name);
    const payLoad = {
      //상대방이름
      //생성자 아이디 넘겨주기
      // roomData: userData?.find(select => select.name === name),
      roomData: name,
      myId: currentUser?.id,
      roomId: id,
    };
    console.log(payLoad.roomData);
    setMode("prompt");
    const roomData = await fetch("/api/chattings/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payLoad),
    });
    const data = await roomData.json();
    setMessageRoomData(data);
    console.log("data", data);
  };

  const handleRoomClick = () => setMode("room");

  const fetchMyChatRooms = async () => {
    try {
      if (!currentUser?.id) return; // Ensure currentUser is loaded
      const response = await fetch("/api/chattings/myChatRooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: currentUser.id }),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch chat rooms");
      }
      const data = await response.json();
      console.log("myChatRooms:", data);
    } catch (error) {
      console.error("Error fetching chat rooms:", error);
    }
  };

  // 내정보
  // const fetchCurrentUser = async () => {
  //   try {
  //     const response = await fetch("/api/auth/me");
  //     if (!response.ok) {
  //       throw new Error("인증된 사용자 정보를 가져오는데 실패했습니다");
  //     }
  //     const data = await response.json();
  //     setCurrentUser(data.user);
  //   } catch (err) {
  //     console.error("사용자 정보를 불러오는 중 오류 발생:", err);
  //   }
  // };

  //유저정보 테스트코드
  const [departments, setDepartments] = useState<DepartmentDto[]>([]);
  const [positions, setPositions] = useState<PositionDto[]>([]);
  const getDepartmentName = (deptId?: number) => {
    if (!deptId) return undefined;
    const dept = departments.find(d => d.id === deptId);
    return dept?.departmentName;
  };

  const getPositionName = (posId?: number) => {
    if (!posId) return undefined;
    const pos = positions.find(p => p.id === posId);
    return pos?.positionName;
  };
  const fetchUsers = async () => {
    try {
      if (!currentUser?.businessNumber) return;

      const usersResponse = await fetch(
        `/api/users?roleId=02&businessNumber=${currentUser.businessNumber}&limit=1000`
      );
      if (!usersResponse.ok) {
        throw new Error("사용자 목록을 불러오는데 실패했습니다");
      }
      const usersData = await usersResponse.json();

      const userDtos = usersData.users.map((user: UserDto) => ({
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        departmentId: user.departmentId,
        positionId: user.positionId,
        departmentName: getDepartmentName(user.departmentId),
        positionName: getPositionName(user.positionId),
        status: user.status || "offline",
        profileMessage: user.profileMessage,
      }));

      const filteredUserDtos = userDtos.filter(
        (user: UserDto) => user.id !== currentUser.id
      );
      console.log(filteredUserDtos);

      setUsers(filteredUserDtos);
      setFilteredUsers(filteredUserDtos);
      console.log("유저 페칭:", filteredUserDtos.length, "명");
    } catch (err) {
      console.error("사용자 목록 업데이트 중 오류 발생:", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // setLoading(true);

        const currentUserResponse = await fetch("/api/auth/me");
        if (!currentUserResponse.ok) {
          throw new Error("사용자 정보를 불러오는데 실패했습니다");
        }
        const currentUserData = await currentUserResponse.json();

        const [departmentsResponse, positionsResponse] = await Promise.all([
          fetch("/api/departments"),
          fetch("/api/positions"),
        ]);

        const departmentsData = departmentsResponse.ok
          ? await departmentsResponse.json()
          : [];
        const positionsData = positionsResponse.ok
          ? await positionsResponse.json()
          : [];

        setDepartments(departmentsData);
        setPositions(positionsData);

        const currentUserDto: UserDto = {
          id: currentUserData.user.id,
          username: currentUserData.user.username,
          nickname: currentUserData.user.nickname,
          departmentId: currentUserData.user.departmentId,
          positionId: currentUserData.user.positionId,
          departmentName: departmentsData.find(
            (d: DepartmentDto) => d.id === currentUserData.user.departmentId
          )?.departmentName,
          positionName: positionsData.find(
            (p: PositionDto) => p.id === currentUserData.user.positionId
          )?.positionName,
          status: currentUserData.user.status || "online",
          businessNumber: currentUserData.user.businessNumber,
        };

        setCurrentUser(currentUserDto);
        console.log("currentUser 세팅 완료:", currentUserDto);
      } catch (err) {
        if (err instanceof Error) {
        }
      } finally {
      }
    };

    fetchData();
  }, []);

  //유저정보 테스트코드

  // 유저정보
  const userFindHandler = useCallback(async () => {
    try {
      const [userResponse, departmentResponse, positionResponse] =
        await Promise.all([
          fetch("/api/users"),
          fetch("/api/departments"),
          fetch("/api/positions"),
        ]);

      if (!userResponse.ok || !departmentResponse.ok || !positionResponse.ok) {
        throw new Error("서버에서 정보를 가져오지 못했습니다.");
      }

      const userData = await userResponse.json();
      const departmentData = await departmentResponse.json();
      const positionData = await positionResponse.json();

      const { users } = userData;
      // console.log(userData);
      // console.log(departmentData);
      // console.log(positionData);

      if (users && departmentData && positionData) {
        const mappedUsers = useMappedUsers(users, departmentData, positionData);

        // Extract only the required fields
        const filterData = mappedUsers.map(user => ({
          id: user.id,
          name: user.username,
          departmentName: user.departmentName,
          positionName: user.positionName,
        }));

        setUserData(filterData as UserProp); // Store the filtered data in state
        console.log("Filtered Users:", filterData);
      }
    } catch (error) {
      console.error("데이터 불러오기 실패:", error);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchUsers();
      userFindHandler();
      fetchMyChatRooms();
    }
  }, [currentUser, userFindHandler]);

  useEffect(() => {
    console.log(userData);
    console.log(currentUser);

    console.log("users:", users);
    console.log("filteredUsers:", filteredUsers);
  }, [userData]);
  return (
    <>
      <div className="w-[400px] overflow-auto  shadow-md rounded-b-lg">
        <ChatHeader mode={mode} onRoomClick={handleRoomClick} />
        <div className="h-[430px] overflow-auto">
          {mode === "user" &&
            filteredUsers.map(user => {
              return (
                <ChatUserList
                  user={user} // userData={userData || []}
                  key={user.id}
                  onPromptClick={handlePromptClick}
                />
              );
            })}
        </div>

        {mode === "room" && (
          <ChatRoomList
          // userData={userData || []}
          // onPromptClick={handlePromptClick}
          />
        )}

        {(mode === "user" || mode === "room") && (
          <ChatFooter
            onUserClick={handleUserSelect}
            onRoomClick={handleRoomClick}
          />
        )}
        {mode === "prompt" && messageRoomData && (
          <MessagePrompt messageRoomData={messageRoomData} />
        )}
      </div>
      <div className="flex items-center justify-center rounded-full border border-[#61441E] w-[65px] h-[65px]">
        {/* 채팅 활성화 아이콘 */}
        <Image src={chatHome} width={50} height={50} alt="chatting-icon" />
      </div>
    </>
  );
}
