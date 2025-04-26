// src/app/user/profile/edit/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProfileImageUpload from "@/app/components/common/ProfileImageUpload";
import { ProfileImageDto } from "@/application/usecases/profileImage/dto/ProfileImageDto";

export default function ProfileEditPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profileImage, setProfileImage] = useState<ProfileImageDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/auth/me");
        
        if (!response.ok) {
          throw new Error("사용자 정보를 불러오는데 실패했습니다");
        }
        
        const data = await response.json();
        setUser(data.user);
      } catch (err) {
        setError(err instanceof Error ? err.message : "사용자 정보를 불러오는데 실패했습니다");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  const handleProfileImageChange = (image: ProfileImageDto | null) => {
    setProfileImage(image);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <div className="bg-red-100 p-4 rounded text-red-700 mb-6">
          {error || "사용자 정보를 불러오는데 실패했습니다"}
        </div>
        <button
          onClick={() => router.push("/")}
          className="bg-amber-500 text-white py-2 px-4 rounded hover:bg-amber-600"
        >
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">내 프로필 수정</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row items-start gap-8">
          {/* 프로필 이미지 업로드 */}
          <div className="w-full md:w-auto flex flex-col items-center">
            <ProfileImageUpload
              userId={user.id}
              onImageChange={handleProfileImageChange}
              size={150}
            />
            <p className="mt-2 text-sm text-gray-600">프로필 이미지 변경</p>
          </div>
          
          {/* 프로필 정보 폼 */}
          <div className="flex-1 w-full">
            <form className="space-y-4">
              {/* 폼 필드들 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  사용자명
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded focus:ring-amber-500 focus:border-amber-500"
                  value={user.username}
                  disabled
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  닉네임
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded focus:ring-amber-500 focus:border-amber-500"
                  value={user.nickname}
                  disabled
                />
              </div>
              
              {/* 저장 버튼 */}
              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={() => router.push("/user/profile")}
                  className="mr-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded"
                >
                  취소
                </button>
                <button
                  type="button"
                  className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded"
                >
                  저장
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}