"use client";
import React from "react";
import { ProfileType } from "@/types/ScheduleType";

interface ProfileContainerProps {
  profile: ProfileType; // 사용자 프로필 정보 (이름, 소속, 직급, 아바타)
}

// ProfileContainer 컴포넌트 구현
const ProfileContainer: React.FC<ProfileContainerProps> = ({ profile }) => {
  return (
    // 프로필 전체 컨테이너
    <div className="flex items-center space-x-4">
      {/* 프로필 이미지 */}
      <img
        src={profile.avatar} // 프로필 이미지 경로
        alt={profile.name} // 대체 텍스트(접근성)
        className="w-28 h-28 rounded-lg object-cover shadow-md"
      />
      {/* 프로필 정보 영역 */}
      <div>
        <h2 className="text-2xl font-bold">{profile.name}</h2> {/* 이름 */}
        <p className="text-gray-600">소속: {profile.title}</p> {/* 소속 */}
        <p className="text-gray-500">직급: {profile.company}</p> {/* 직급 */}
      </div>
    </div>
  );
};

export default ProfileContainer;
