"use client";

import { useState, useEffect } from "react";
import UserCard from "@/app/components/user/UserCard";
import Header from "@/app/components/common/Header";
import { UserDto } from "@/application/usecases/user/dto/UserDto";
import { DepartmentDto, PositionDto } from "@/application/usecases/dto";

export default function UserDashboard() {
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

  // 주기적으로 사용자 목록 업데이트
  useEffect(() => {
    if (!currentUser) return;

    const intervalId = setInterval(() => {
      fetchUsers();
    }, 30000); // 300초마다

    return () => clearInterval(intervalId);
  }, [currentUser]);

  // 검색어 변경시 필터링
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(users);
      return;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = users.filter(
      (user) =>
        user.nickname.toLowerCase().includes(lowerSearchTerm) ||
        user.departmentName?.toLowerCase()?.includes(lowerSearchTerm) ||
        user.positionName?.toLowerCase()?.includes(lowerSearchTerm)
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-4 text-gray-700">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        username={currentUser?.nickname}
        userId={currentUser?.id}
        userStatus={userStatus}
        onStatusChange={handleStatusChange}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
            {error}
          </div>
        )}

        {/* 검색 바 */}
        <div className="mb-8">
          <div className="flex shadow-sm rounded-md overflow-hidden">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="이름, 부서, 직급으로 검색"
              className="flex-grow px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button className="bg-amber-500 text-white px-4 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* 사용자 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              검색 결과가 없습니다
            </div>
          ) : (
            filteredUsers.map((user) => <UserCard key={user.id} user={user} />)
          )}
        </div>
      </main>
    </div>
  );
}
