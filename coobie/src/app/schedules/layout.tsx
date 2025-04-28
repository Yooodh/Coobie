"use client";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Header from "../components/common/Header";
import { useEffect, useState } from "react";
import { UserDto } from "@/application/usecases/user/dto/UserDto";
import { DepartmentDto, PositionDto } from "@/application/usecases/dto";

export default function TestLayout({
  children,
}: {
  children: React.ReactNode;
  }) {
  
    const [currentUser, setCurrentUser] = useState<UserDto | null>(null);
    const [users, setUsers] = useState<UserDto[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<UserDto[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userStatus, setUserStatus] = useState<
      "online" | "offline" | "busy" | "away"
    >("offline");
  
    const [departments, setDepartments] = useState<DepartmentDto[]>([]);
    const [positions, setPositions] = useState<PositionDto[]>([]);
  
  
  
  
  const getDepartmentName = (deptId?: number) => {
      if (!deptId) return undefined;
      const dept = departments.find((d) => d.id === deptId);
      return dept?.departmentName;
    };
  
    const getPositionName = (posId?: number) => {
      if (!posId) return undefined;
      const pos = positions.find((p) => p.id === posId);
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
  
        setUsers(filteredUserDtos);
        setFilteredUsers(filteredUserDtos);
        console.log("유저 페칭:", filteredUserDtos.length, "명");
      } catch (err) {
        console.error("사용자 목록 업데이트 중 오류 발생:", err);
      }
    };
  
    // 초기 데이터 로딩
    useEffect(() => {
      const fetchData = async () => {
        try {
          setLoading(true);
  
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
  
          setUserStatus(currentUserDto.status || "online");
        } catch (err) {
          if (err instanceof Error) {
            setError(err.message || "데이터를 불러오는 중 오류가 발생했습니다");
          }
        } finally {
          setLoading(false);
        }
      };
  
      fetchData();
    }, []);
  
    // currentUser가 준비된 후 사용자 목록 가져오기
    useEffect(() => {
      if (!currentUser) return;
      fetchUsers();
    }, [currentUser]);

    const handleStatusChange = async (
      newStatus: "online" | "offline" | "busy" | "away"
    ) => {
      try {
        setUserStatus(newStatus);
  
        const response = await fetch("/api/users/status", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        });
  
        if (!response.ok) {
          throw new Error("상태 변경에 실패했습니다");
        }
  
        setCurrentUser((prev) => (prev ? { ...prev, status: newStatus } : null));
      } catch (err) {
        console.error("상태 변경 중 오류 발생:", err);
        if (currentUser?.status) {
          setUserStatus(currentUser.status);
        }
      }
    };
  return (
    <>
      <Header
        username={currentUser?.nickname}
        userId={currentUser?.id}
        userStatus={userStatus}
        onStatusChange={handleStatusChange}
      />
      <DndProvider backend={HTML5Backend}>{children}</DndProvider>;
    </>
  );
}
