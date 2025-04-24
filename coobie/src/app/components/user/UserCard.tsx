// src/app/components/user/UserCard.tsx
"use client";

import { UserDto } from "@/application/usecases/user/dto/UserDto";
import Image from "next/image";
import Link from "next/link";

interface UserCardProps {
  user: UserDto;
}

function UserCard({ user }: UserCardProps) {
  return (
    <Link href={`/user/profile/${user.id}`}>
      <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
        <div className="flex items-start">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
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
            </div>
            {/* 오프라인 상태로 고정 */}
            <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white bg-gray-400"></div>
          </div>
          <div className="ml-4 flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-900">{user.nickname}</h3>
                <div className="text-xs text-gray-500 mt-1">
                  {user.departmentName && user.positionName 
                    ? `${user.departmentName} / ${user.positionName}`
                    : user.departmentName || user.positionName || "부서/직급 미지정"}
                </div>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                오프라인
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