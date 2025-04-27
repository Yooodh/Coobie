// src/app/user/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/common/Header";
import ProfileImageUpload from "@/app/components/common/ProfileImageUpload";
import { UserDto } from "@/application/usecases/user/dto/UserDto";
import { DepartmentDto, PositionDto } from "@/application/usecases/dto";
import { ProfileImageDto } from "@/application/usecases/profileImage/dto/ProfileImageDto";

export default function UserProfile() {
  const router = useRouter();
  const [user, setUser] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userStatus, setUserStatus] = useState<
    "online" | "offline" | "busy" | "away"
  >("online");
  const [profileMessage, setProfileMessage] = useState("");
  const [isEditingMessage, setIsEditingMessage] = useState(false);

  // 부서 및 직급 관련 상태 추가
  const [departments, setDepartments] = useState<DepartmentDto[]>([]);
  const [positions, setPositions] = useState<PositionDto[]>([]);

  // 현재 사용자 정보 가져오기
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);

        // 부서 및 직급 먼저 가져오기
        const [departmentsResponse, positionsResponse] = await Promise.all([
          fetch("/api/departments"),
          fetch("/api/positions"),
        ]);

        const response2 = await fetch("/api/auth/me");
        const userData2 = await response2.json();

        const departmentsData = departmentsResponse.ok
          ? await departmentsResponse.json()
          : [];
        const positionsData = positionsResponse.ok
          ? await positionsResponse.json()
          : [];

        setDepartments(departmentsData);
        setPositions(positionsData);

        // 사용자 정보 가져오기
        const response = await fetch("/api/auth/me");
        if (!response.ok) {
          throw new Error("사용자 정보를 불러오는데 실패했습니다");
        }
        const userData = await response.json();

        // 부서명과 직급명 찾기
        const departmentName = departmentsData.find(
          (d: DepartmentDto) => d.id === userData.user.departmentId
        )?.departmentName;

        const positionName = positionsData.find(
          (p: PositionDto) => p.id === userData.user.positionId
        )?.positionName;

        // 사용자 정보 매핑
        const userDto: UserDto = {
          id: userData.user.id,
          username: userData.user.username,
          nickname: userData.user.nickname,
          departmentId: userData.user.departmentId,
          positionId: userData.user.positionId,
          departmentName: departmentName,
          positionName: positionName,
          status: userData.user.status || "online",
          profileMessage: userData.user.profileMessage || "",
          businessNumber: userData.user.businessNumber,
        };

        setUser(userDto);
        setUserStatus(userDto.status || "online");
        setProfileMessage(userDto.profileMessage || "");
        console.log("사용자 정보 설정 완료:", userDto);
      } catch (err) {
        if (err instanceof Error) {
          setError(
            err.message || "사용자 정보를 불러오는 중 오류가 발생했습니다"
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // 상태 변경 처리
  const handleStatusChange = async (
    newStatus: "online" | "offline" | "busy" | "away"
  ) => {
    try {
      setUserStatus(newStatus);

      // API로 상태 변경 요청 보내기
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

      // 현재 사용자 상태 업데이트
      setUser((prev) => (prev ? { ...prev, status: newStatus } : null));
    } catch (err) {
      console.error("상태 변경 중 오류 발생:", err);
      // 실패 시 이전 상태로 복원
      if (user?.status) {
        setUserStatus(user.status);
      }
    }
  };

  // 프로필 메시지 저장
  const saveProfileMessage = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/users/${user.id}/profile-message`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ profileMessage }),
      });

      if (!response.ok) {
        throw new Error("프로필 메시지 업데이트에 실패했습니다");
      }

      // 사용자 정보 업데이트
      setUser((prev) => (prev ? { ...prev, profileMessage } : null));
      setIsEditingMessage(false);
    } catch (err) {
      console.error("프로필 메시지 업데이트 중 오류 발생:", err);
      alert("프로필 메시지 저장에 실패했습니다");
    }
  };

  // 프로필 이미지 변경 처리
  const handleImageChange = (newImageUrl: ProfileImageDto | null) => {
    if (user) {
      setUser({
        ...user,
        profileImageUrl: newImageUrl?.fileUrl || undefined,
      });
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

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error || "사용자 정보를 불러올 수 없습니다"}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <Header
        username={user.nickname}
        userId={user.id}
        userStatus={userStatus}
        onStatusChange={handleStatusChange}
      />

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* 프로필 헤더 */}
          <div className="bg-amber-500 h-32 relative">{/* 배경 이미지 */}</div>

          {/* 프로필 정보 */}
          <div className="px-6 py-4 flex flex-col items-center -mt-16">
            <ProfileImageUpload
              userId={user.id}
              currentImageUrl={user.profileImageUrl}
              onImageChange={handleImageChange}
              size={120}
            />

            <h1 className="text-2xl font-bold mt-4">{user.nickname}</h1>

            <div className="text-gray-600 mb-2">
              {user.departmentName && user.positionName
                ? `${user.departmentName} / ${user.positionName}`
                : user.departmentName ||
                  user.positionName ||
                  "부서/직급 미지정"}
            </div>

            <div className="flex items-center text-sm text-gray-500 mb-4">
              <div
                className={`w-3 h-3 rounded-full mr-2 ${
                  userStatus === "online"
                    ? "bg-green-500"
                    : userStatus === "busy"
                    ? "bg-red-500"
                    : userStatus === "away"
                    ? "bg-yellow-500"
                    : "bg-gray-400"
                }`}
              ></div>
              <span>
                {userStatus === "online"
                  ? "온라인"
                  : userStatus === "busy"
                  ? "방해 금지"
                  : userStatus === "away"
                  ? "자리 비움"
                  : "오프라인"}
              </span>
            </div>

            {/* 프로필 메시지 */}
            <div className="w-full max-w-md mb-6">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">상태 메시지</h2>
                <button
                  onClick={() => setIsEditingMessage(!isEditingMessage)}
                  className="text-sm text-amber-600 hover:text-amber-800"
                >
                  {isEditingMessage ? "취소" : "편집"}
                </button>
              </div>

              {isEditingMessage ? (
                <div className="flex items-center">
                  <input
                    type="text"
                    value={profileMessage}
                    onChange={(e) => setProfileMessage(e.target.value)}
                    maxLength={100}
                    placeholder="상태 메시지를 입력하세요"
                    className="flex-grow p-2 border rounded focus:ring-amber-500 focus:border-amber-500"
                  />
                  <button
                    onClick={saveProfileMessage}
                    className="ml-2 px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600"
                  >
                    저장
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg">
                  {profileMessage || "상태 메시지가 없습니다"}
                </div>
              )}
            </div>

            {/* 스케줄 관리 링크 */}
            <div className="w-full max-w-md">
              <button
                onClick={() => router.push("/user/dashboard")}
                className="w-full py-3 px-4 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
              >
                프로필 저장
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
