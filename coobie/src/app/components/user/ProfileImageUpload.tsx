// src/app/components/user/ProfileImageUpload.tsx
"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import ProfileImage from "./ProfileImage";

interface ProfileImageUploadProps {
  userId: string;
  currentImageUrl?: string | null;
  onImageChange?: (url: string | null) => void;
  size?: number;
}

export default function ProfileImageUpload({
  userId,
  currentImageUrl,
  onImageChange,
  size = 100,
}: ProfileImageUploadProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(currentImageUrl || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 파일 업로드 처리
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError(null);

      // 파일 크기 검증 (5MB 이하)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("파일 크기가 5MB를 초과합니다");
      }

      // 파일 형식 검증
      if (!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type)) {
        throw new Error("지원되지 않는 파일 형식입니다. JPEG, PNG, GIF, WebP만 허용됩니다");
      }

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/users/profile-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "이미지 업로드에 실패했습니다");
      }

      const data = await response.json();
      setImageUrl(data.imageUrl);
      
      // 부모 컴포넌트에 변경 사항 알림
      if (onImageChange) {
        onImageChange(data.imageUrl);
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "업로드 실패");
    } finally {
      setUploading(false);
      // 파일 인풋 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // 이미지 삭제 처리
  const handleRemoveImage = async () => {
    if (!confirm("프로필 이미지를 삭제하시겠습니까?")) return;

    try {
      setUploading(true);
      setError(null);

      const response = await fetch("/api/users/profile-image", {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "이미지 삭제에 실패했습니다");
      }

      setImageUrl(null);
      
      // 부모 컴포넌트에 변경 사항 알림
      if (onImageChange) {
        onImageChange(null);
      }
    } catch (err) {
      console.error("Delete error:", err);
      setError(err instanceof Error ? err.message : "삭제 실패");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* 프로필 이미지 표시 영역 */}
      <div className="relative mb-4">
        <div className={uploading ? "opacity-50" : ""}>
          {imageUrl ? (
            <div className="relative rounded-full overflow-hidden" style={{ width: `${size}px`, height: `${size}px` }}>
              <Image
                src={imageUrl}
                alt="Profile"
                layout="fill"
                objectFit="cover"
              />
            </div>
          ) : (
            <ProfileImage userId={userId} size={size} />
          )}
        </div>

        {/* 업로드 중 로딩 인디케이터 */}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-t-2 border-b-2 border-amber-500 rounded-full animate-spin"></div>
          </div>
        )}

        {/* 이미지 변경 버튼 */}
        <label
          htmlFor="profile-image-upload"
          className="absolute bottom-0 right-0 bg-amber-500 hover:bg-amber-600 text-white rounded-full p-2 cursor-pointer shadow-md"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </label>
      </div>

      {/* 에러 메시지 */}
      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}

      {/* 컨트롤 버튼 그룹 */}
      <div className="flex items-center space-x-2">
        <input
          id="profile-image-upload"
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
          disabled={uploading}
        />

        {imageUrl && (
          <button
            type="button"
            onClick={handleRemoveImage}
            disabled={uploading}
            className="text-red-500 hover:text-red-700 text-sm"
          >
            이미지 삭제
          </button>
        )}
      </div>
    </div>
  );
} 