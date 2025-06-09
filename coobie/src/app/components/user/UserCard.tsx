// src/app/components/user/UserCard.tsx (수정된 버전)
"use client";

import { UserDto } from "@/application/usecases/user/dto/UserDto";
import Link from "next/link";
import ProfileImage from "@/app/components/common/ProfileImage";

interface UserCardProps {
  user: UserDto;
}

function UserCard({ user }: UserCardProps) {
  return (
    <Link href={`/schedules/${user.id}`}>
      <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
        <div className="flex items-start">
          {/* 프로필 이미지 컴포넌트로 교체 */}
          <ProfileImage
            userId={user.id}
            size={64}
            showStatus={true}
            status={user.status}
          />

          <div className="ml-4 flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-900">{user.nickname}</h3>
                <div className="text-xs text-gray-500 mt-1">
                  {user.departmentName && user.positionName
                    ? `${user.departmentName} / ${user.positionName}`
                    : user.departmentName ||
                      user.positionName ||
                      "부서/직급 미지정"}
                </div>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                {user.status === "online"
                  ? "온라인"
                  : user.status === "busy"
                  ? "방해 금지"
                  : user.status === "away"
                  ? "자리 비움"
                  : "오프라인"}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-2 line-clamp-2">
              {user.username}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default UserCard;
