// src/app/components/common/ProfileImage.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ProfileImageDto } from "@/application/usecases/profileImage/dto/ProfileImageDto";

interface ProfileImageProps {
  userId: string;
  size?: number;
  className?: string;
  showStatus?: boolean;
  status?: "online" | "offline" | "busy" | "away";
}

export default function ProfileImage({
  userId,
  size = 40,
  className = "",
  showStatus = false,
  status = "offline"
}: ProfileImageProps) {
  const [image, setImage] = useState<ProfileImageDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchProfileImage();
    }
  }, [userId]);

  const fetchProfileImage = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/profile-image?userId=${userId}`);
      const data = await response.json();
      
      if (response.ok && data.profileImage) {
        setImage(data.profileImage);
      }
    } catch (err) {
      console.error("프로필 이미지 로딩 중 오류 발생:", err);
    } finally {
      setLoading(false);
    }
  };

  // 상태에 따른 색상 지정
  const getStatusColor = () => {
    switch (status) {
      case "online": return "bg-green-500";
      case "busy": return "bg-red-500";
      case "away": return "bg-yellow-500";
      default: return "bg-gray-400";
    }
  };

  // 이니셜 가져오기 (이미지가 없을 경우 사용)
  const getInitial = (userId: string) => {
    // userId의 첫 글자를 대문자로 반환
    return userId.charAt(0).toUpperCase();
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className={`relative rounded-full overflow-hidden bg-gray-200 flex items-center justify-center 
          ${loading ? "animate-pulse" : ""}`}
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        {image ? (
          <Image
            src={image.fileUrl}
            alt="프로필 이미지"
            fill
            sizes={`${size}px`}
            className="object-cover"
          />
        ) : (
          <div className="text-gray-600 font-bold flex items-center justify-center h-full w-full">
            {getInitial(userId)}
          </div>
        )}
      </div>
      
      {/* 상태 표시 (선택적) */}
      {showStatus && (
        <div 
          className={`absolute bottom-0 right-0 w-${Math.max(2, size/8)} h-${Math.max(2, size/8)} 
            rounded-full border-2 border-white ${getStatusColor()}`}
        ></div>
      )}
    </div>
  );
}