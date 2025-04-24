// src/app/user/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface User {
  id: string;
  username: string;
  nickname: string;
  departmentId?: number;
  departmentName?: string;
  positionId?: number;
  positionName?: string;
  profileMessage?: string;
  status: "online" | "offline" | "busy" | "away";
  profileImageUrl?: string;
}

// 유저 카드 컴포넌트
const UserCard = ({ user }: { user: User }) => {
  // 상태에 따른 색상 처리
  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "busy":
        return "bg-red-500";
      case "away":
        return "bg-yellow-500";
      default:
        return "bg-gray-400";
    }
  };

  // 상태 텍스트 변환
  const getStatusText = (status: string) => {
    switch (status) {
      case "online":
        return "온라인";
      case "busy":
        return "바쁨";
      case "away":
        return "자리비움";
      default:
        return "오프라인";
    }
  };

  return (
    <Link href={`/user/profile/${user.id}`}>
      <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
        <div className="flex items-start">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
              {user.profileImageUrl ? (
                <Image
                  src={user.profileImageUrl}
                  alt={user.nickname}
                  width={64}
                  height={64}
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              )}
            </div>
            <div
              className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(
                user.status
              )}`}
            ></div>
          </div>
          <div className="ml-4 flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-900">{user.nickname}</h3>
                <div className="text-xs text-gray-500 mt-1">
                  {user.departmentName && user.positionName
                    ? `${user.departmentName} / ${user.positionName}`
                    : user.departmentName || user.positionName || "부서 미지정"}
                </div>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  user.status === "online"
                    ? "bg-green-100 text-green-800"
                    : user.status === "busy"
                    ? "bg-red-100 text-red-800"
                    : user.status === "away"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {getStatusText(user.status)}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-2 line-clamp-2">
              {user.profileMessage || "상태 메시지가 없습니다."}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default function UserDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 현재 사용자 정보 가져오기
        const currentUserResponse = await fetch("/api/auth/me");
        if (!currentUserResponse.ok) {
          throw new Error("사용자 정보를 불러오는데 실패했습니다");
        }
        const currentUserData = await currentUserResponse.json();

        // 사용자 목록 가져오기 (같은 회사 소속의 일반 사용자들)
        const usersResponse = await fetch(`/api/users?roleId=02&businessNumber=${currentUserData.user.businessNumber}`);
        if (!usersResponse.ok) {
          throw new Error("사용자 목록을 불러오는데 실패했습니다");
        }
        const usersData = await usersResponse.json();

        setCurrentUser(currentUserData.user);
        setUsers(usersData.users || []);
        setFilteredUsers(usersData.users || []);
      } catch (err: any) {
        setError(err.message || "데이터를 불러오는 중 오류가 발생했습니다");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 검색어에 따른 사용자 필터링
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(users);
      return;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = users.filter(
      (user) =>
        user.nickname.toLowerCase().includes(lowerSearchTerm) ||
        (user.departmentName && user.departmentName.toLowerCase().includes(lowerSearchTerm)) ||
        (user.positionName && user.positionName.toLowerCase().includes(lowerSearchTerm))
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      router.push("/");
    } catch (err) {
      console.error("로그아웃 중 오류가 발생했습니다:", err);
    }
  };

  // 상태 변경 처리
  const handleStatusChange = async (status: string) => {
    try {
      const response = await fetch("/api/users/status", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setCurrentUser(prev => prev ? { ...prev, status: status as any } : null);
      }
    } catch (err) {
      console.error("상태 변경 중 오류가 발생했습니다:", err);
    }
  };

  // 채팅 모달
  const [showChatModal, setShowChatModal] = useState(false);

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
      {/* 헤더 */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Image 
              src="/images/Coobie_logo.png" 
              alt="Coobie Logo" 
              width={120} 
              height={40} 
              priority 
            />
          </div>
          <div className="flex items-center">
            {currentUser && (
              <div className="relative mr-6 group">
                <button className="flex items-center">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                      {currentUser.profileImageUrl ? (
                        <Image
                          src={currentUser.profileImageUrl}
                          alt={currentUser.nickname}
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                        currentUser.status === "online"
                          ? "bg-green-500"
                          : currentUser.status === "busy"
                          ? "bg-red-500"
                          : currentUser.status === "away"
                          ? "bg-yellow-500"
                          : "bg-gray-400"
                      }`}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    {currentUser.nickname}
                  </span>
                  <svg
                    className="ml-1 h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                {/* 상태 변경 드롭다운 */}
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 hidden group-hover:block z-10">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    <button
                      onClick={() => handleStatusChange("online")}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 w-full hover:bg-gray-100"
                    >
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      온라인
                    </button>
                    <button
                      onClick={() => handleStatusChange("busy")}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 w-full hover:bg-gray-100"
                    >
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                      바쁨
                    </button>
                    <button
                      onClick={() => handleStatusChange("away")}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 w-full hover:bg-gray-100"
                    >
                      <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                      자리비움
                    </button>
                    <button
                      onClick={() => handleStatusChange("offline")}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 w-full hover:bg-gray-100"
                    >
                      <div className="w-3 h-3 rounded-full bg-gray-400 mr-2"></div>
                      오프라인
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <Link
                      href="/user/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      마이페이지
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block px-4 py-2 text-sm text-red-700 w-full text-left hover:bg-gray-100"
                    >
                      로그아웃
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
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

        {/* 사용자 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              검색 결과가 없습니다
            </div>
          ) : (
            filteredUsers.map((user) => (
              <UserCard key={user.id} user={user} />
            ))
          )}
        </div>
      </main>

      {/* 채팅 버튼 (우측 하단 고정) */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={() => setShowChatModal(!showChatModal)}
          className="bg-amber-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-amber-600 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>
      </div>

      {/* 채팅 모달 */}
      {showChatModal && (
        <div className="fixed bottom-24 right-6 w-80 bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="p-4 bg-amber-500 text-white flex justify-between items-center">
            <h3 className="font-medium">메시지</h3>
            <button onClick={() => setShowChatModal(false)}>
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="h-96 overflow-y-auto p-4">
            <div className="flex flex-col space-y-2">
              {users.slice(0, 5).map((user) => (
                <div
                  key={user.id}
                  className="flex items-center p-2 hover:bg-gray-50 rounded-md cursor-pointer"
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                      {user.profileImageUrl ? (
                        <Image
                          src={user.profileImageUrl}
                          alt={user.nickname}
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                        user.status === "online"
                          ? "bg-green-500"
                          : user.status === "busy"
                          ? "bg-red-500"
                          : user.status === "away"
                          ? "bg-yellow-500"
                          : "bg-gray-400"
                      }`}
                    ></div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {user.nickname}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.departmentName || "부서 미지정"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 bg-gray-50 border-t">
            <div className="flex">
              <input
                type="text"
                placeholder="메시지 입력..."
                className="flex-grow px-3 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button className="bg-amber-500 text-white px-4 py-2 rounded-r-md hover:bg-amber-600">
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
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}