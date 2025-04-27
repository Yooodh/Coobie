// src/app/components/common/Header.tsx
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ProfileImage from "@/app/components/common/ProfileImage";

interface HeaderProps {
  username?: string;
  userId?: string;
  userStatus?: "online" | "offline" | "busy" | "away";
  onStatusChange?: (status: "online" | "offline" | "busy" | "away") => void;
}

export default function Header({
  username = "User",
  userId = "",
  userStatus = "online",
  onStatusChange,
}: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  // 로그아웃 처리 함수
  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        router.push("/");
      } else {
        console.error("로그아웃 중 오류가 발생했습니다.");
      }
    } catch (err) {
      console.error("로그아웃 요청 실패:", err);
    }
  };

  // 상태에 따른 색상 지정
  const getStatusColor = () => {
    switch (userStatus) {
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

  return (
    <header className="w-full bg-white py-2 shadow-sm">
      <div className="flex items-center justify-between mx-auto px-4 max-w-7xl h-14">
        {/* 로고 - 왼쪽 */}
        <Link href="/" className="flex items-center">
          <Image
            src="/images/Coobie_logo.png"
            alt="Coobie Logo"
            width={120}
            height={40}
            priority
          />
        </Link>

        {/* 사용자 정보 및 드롭다운 - 오른쪽 */}
        <div className="relative">
          <button
            className="flex items-center space-x-2"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <span className="text-gray-700">반갑습니다</span>
            <div className="flex items-center">
              <span className="font-medium text-amber-500">{username}님</span>
              <div className="relative ml-2">
                {/* 사용자 프로필 이미지 */}
                <ProfileImage
                  userId={userId}
                  size={32}
                  showStatus={true}
                  status={userStatus}
                />
              </div>
              <svg
                className={`ml-1 h-5 w-5 text-gray-400 transition-transform duration-200 ${
                  dropdownOpen ? "transform rotate-180" : ""
                }`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </button>

          {/* 드롭다운 메뉴 */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 py-2 bg-white border rounded-md shadow-lg z-20">
              <Link
                href="/mypage"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setDropdownOpen(false)}
              >
                스케줄 관리
              </Link>
              <Link
                href="/user/profile"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setDropdownOpen(false)}
              >
                프로필 설정
              </Link>

              {/* 상태 변경 옵션 */}
              {onStatusChange && (
                <div className="py-1 border-t border-gray-100">
                  <p className="px-4 py-1 text-xs text-gray-500">상태 변경</p>
                  <button
                    onClick={() => {
                      onStatusChange("online");
                      setDropdownOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    온라인
                  </button>
                  <button
                    onClick={() => {
                      onStatusChange("busy");
                      setDropdownOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                    방해 금지
                  </button>
                  <button
                    onClick={() => {
                      onStatusChange("away");
                      setDropdownOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                    자리 비움
                  </button>
                </div>
              )}

              {/* 로그아웃 버튼 */}
              <div className="border-t border-gray-100 mt-1">
                <button
                  onClick={() => {
                    handleLogout();
                    setDropdownOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  로그아웃
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}