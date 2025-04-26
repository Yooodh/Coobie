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
      // 올바른 API 엔드포인트 사용
      const response = await fetch(`/api/users/profile-image?userId=${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.profileImage) {
          setImage(data.profileImage);
        }
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

  return (
    <div className={`relative ${className}`}>
      <div
        className={`relative rounded-full overflow-hidden bg-gray-200 flex items-center justify-center 
          ${loading ? "animate-pulse" : ""}`}
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        {loading ? (
          <div className="animate-pulse w-full h-full bg-gray-300"></div>
        ) : image && image.fileUrl ? (
          <Image
            src={image.fileUrl}
            alt="프로필 이미지"
            fill
            sizes={`${size}px`}
            className="object-cover"
            onError={() => {
              setImage(null);
            }}
          />
        ) : (
          <Image
            src="/images/쿠비 파비콘.png"
            alt="기본 프로필 이미지"
            fill
            sizes={`${size}px`}
            className="object-cover"
          />
        )}
      </div>
      
      {/* 상태 표시 (선택적) */}
      {showStatus && (
        <div 
          className={`absolute bottom-0 right-0 rounded-full border-2 border-white ${getStatusColor()}`}
          style={{ width: `${size/4}px`, height: `${size/4}px` }}
        ></div>
      )}
    </div>
  );
}