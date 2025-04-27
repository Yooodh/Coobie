// src/app/user/profile/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/common/Header";
import ProfileImage from "@/app/components/user/ProfileImage";
import { UserDto } from "@/application/usecases/user/dto/UserDto";

export default function ViewUserProfile({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserDto | null>(null);
  const [viewedUser, setViewedUser] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 현재 사용자와 조회 대상 사용자 정보 가져오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 부서 및 직급 정보 가져오기
        const [deptResponse, posResponse] = await Promise.all([
          fetch("/api/departments"),
          fetch("/api/positions")
        ]);
        
        const departments = deptResponse.ok ? await deptResponse.json() : [];
        const positions = posResponse.ok ? await posResponse.json() : [];
        
        // 부서명과 직급명 매핑 함수
        const getDepartmentName = (deptId?: number) => {
          if (!deptId) return undefined;
          const dept = departments.find((d: any) => d.id === deptId);
          return dept?.departmentName;
        };
        
        const getPositionName = (posId?: number) => {
          if (!posId) return undefined;
          const pos = positions.find((p: any) => p.id === posId);
          return pos?.positionName;
        };

        // 현재 로그인한 사용자 정보 가져오기
        const currentUserResponse = await fetch("/api/auth/me");
        if (!currentUserResponse.ok) {
          throw new Error("사용자 정보를 불러오는데 실패했습니다");
        }
        
        const currentUserData = await currentUserResponse.json();
        
        const currentUserDto: UserDto = {
          id: currentUserData.user.id,
          username: currentUserData.user.username,
          nickname: currentUserData.user.nickname,
          departmentId: currentUserData.user.departmentId,
          positionId: currentUserData.user.positionId,
          departmentName: getDepartmentName(currentUserData.user.departmentId),
          positionName: getPositionName(currentUserData.user.positionId),
          status: currentUserData.user.status || "online"
        };
        
        setCurrentUser(currentUserDto);

        // 조회 대상 사용자가 현재 사용자와 동일한 경우
        if (params.id === currentUserData.user.id) {
          router.push("/user/profile"); // 마이 프로필로 리다이렉트
          return;
        }

        // 조회 대상 사용자 정보 가져오기
        const viewedUserResponse = await fetch(`/api/users/${params.id}`);
        if (!viewedUserResponse.ok) {
          throw new Error("사용자 정보를 불러오는데 실패했습니다");
        }
        
        const viewedUserData = await viewedUserResponse.json();
        
        const viewedUserDto: UserDto = {
          id: viewedUserData.id,
          username: viewedUserData.username,
          nickname: viewedUserData.nickname,
          departmentId: viewedUserData.departmentId,
          positionId: viewedUserData.positionId,
          departmentName: getDepartmentName(viewedUserData.departmentId),
          positionName: getPositionName(viewedUserData.positionId),
          status: viewedUserData.status || "offline",
          profileMessage: viewedUserData.profileMessage
        };
        
        setViewedUser(viewedUserDto);
      } catch (err: any) {
        setError(err.message || "사용자 정보를 불러오는 중 오류가 발생했습니다");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [params.id, router]);

  // 채팅 시작
  const startChat = async () => {
    if (!currentUser || !viewedUser) return;
    
    // 채팅 시작 로직
    try {
      const response = await fetch("/api/chattings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: currentUser.id,
          name: viewedUser.nickname,
        }),
      });
      
      if (!response.ok) {
        throw new Error("채팅 방 생성에 실패했습니다");
      }
      
      const data = await response.json();
      
      // 채팅 페이지로 이동
      router.push(`/chatting?roomId=${data.newChatRoom.id}`);
    } catch (err) {
      console.error("채팅 시작 중 오류 발생:", err);
      alert("채팅을 시작할 수 없습니다. 다시 시도해주세요.");
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

  if (error || !viewedUser || !currentUser) {
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
        username={currentUser.nickname} 
        userId={currentUser.id}
        userStatus={currentUser.status}
      />

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* 프로필 헤더 */}
          <div className="bg-amber-500 h-32 relative">
            {/* 배경 이미지 */}
          </div>

          {/* 프로필 정보 */}
          <div className="px-6 py-4 flex flex-col items-center -mt-16">
            {/* 프로필 이미지 */}
            <div className="relative">
              <ProfileImage 
                userId={viewedUser.id}
                size={120}
                showStatus={true}
                status={viewedUser.status}
              />
            </div>
            
            <h1 className="text-2xl font-bold mt-4">{viewedUser.nickname}</h1>
            
            <div className="text-gray-600 mb-2">
              {viewedUser.departmentName && viewedUser.positionName
                ? `${viewedUser.departmentName} / ${viewedUser.positionName}`
                : viewedUser.departmentName || viewedUser.positionName || "부서/직급 미지정"}
            </div>
            
            <div className="flex items-center text-sm text-gray-500 mb-4">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                viewedUser.status === "online" ? "bg-green-500" :
                viewedUser.status === "busy" ? "bg-red-500" :
                viewedUser.status === "away" ? "bg-yellow-500" : "bg-gray-400"
              }`}></div>
              <span>
                {viewedUser.status === "online" ? "온라인" :
                viewedUser.status === "busy" ? "방해 금지" :
                viewedUser.status === "away" ? "자리 비움" : "오프라인"}
              </span>
            </div>
            
            {/* 프로필 메시지 */}
            {viewedUser.profileMessage && (
              <div className="w-full max-w-md mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold">상태 메시지</h2>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  {viewedUser.profileMessage}
                </div>
              </div>
            )}
            
            {/* 채팅 시작 버튼 */}
            <div className="w-full max-w-md">
              <button
                onClick={startChat}
                className="w-full py-3 px-4 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
              >
                채팅하기
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}