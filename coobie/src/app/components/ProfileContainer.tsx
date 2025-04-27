"use client";
import { ProfileType } from "@/types/ScheduleType";
import Image from "next/image";

interface ProfileContainerProps {
  profile?: ProfileType;
}

const ProfileContainer: React.FC<ProfileContainerProps> = ({ profile }) => {
  if (!profile) {
    return (
      <div className="flex items-center space-x-4 animate-pulse">
        <div className="w-28 h-28 bg-gray-200 rounded-lg" />
        <div>
          <div className="h-6 bg-gray-200 w-32 mb-2" />
          <div className="h-4 bg-gray-200 w-24 mb-1" />
          <div className="h-4 bg-gray-200 w-20" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      {/* 아바타 이미지 */}
      {/* <Image
        src={profile.avatar}
        alt={profile.name}
        width={112}
        height={112}
        className="w-28 h-28 rounded-lg object-cover shadow-md"
        onError={(e) => {
          (e.target as HTMLImageElement).src = "/default-avatar.png";
        }}
      /> */}
      <div>
        <h2 className="text-2xl font-bold">
          {profile.nickname || profile.name}
        </h2>

        <p className="text-gray-600">
          소속: {profile.department || "정보 없음"}
        </p>
        <p className="text-gray-500">직급: {profile.position || "정보 없음"}</p>
      </div>
    </div>
  );
};

export default ProfileContainer;
