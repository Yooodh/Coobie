"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ProfileImageDto } from "@/application/usecases/profileImage/dto/ProfileImageDto";

interface ProfileImageUploadProps {
  userId: string;
  initialImage?: ProfileImageDto | null;
  currentImageUrl?: string;
  onImageChange?: (image: ProfileImageDto | null) => void;
  className?: string;
  size?: number;
  disabled?: boolean;
}

export default function ProfileImageUpload({
  userId,
  initialImage,
  onImageChange,
  className = "",
  size = 150,
  disabled = false,
}: ProfileImageUploadProps) {
  const [image, setImage] = useState<ProfileImageDto | null>(
    initialImage || null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!initialImage && userId) {
      fetchProfileImage();
    }
  }, [userId, initialImage]);

  const fetchProfileImage = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/profile-image?userId=${userId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "이미지를 불러오는데 실패했습니다");
      }

      const data = await response.json();

      if (data.success && data.profileImage) {
        setImage(data.profileImage);
        onImageChange?.(data.profileImage);
      }
    } catch (err) {
      console.error("프로필 이미지 로딩 중 오류 발생:", err);
      // 오류가 발생해도 이미지를 가져오지 못하는 것은 일반적인 상황일 수 있으므로
      // 사용자 오류 메시지는 표시하지 않습니다
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = () => {
    if (!disabled && !loading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/users/profile-image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log(data)

      if (!response.ok || !data.success) {
        throw new Error(data.error || "이미지 업로드 중 오류가 발생했습니다");
      }

      setImage(data.profileImage);
      onImageChange?.(data.profileImage);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "이미지 업로드 중 오류가 발생했습니다"
      );
      console.error("이미지 업로드 중 오류:", err);
    } finally {
      setLoading(false);
      // 파일 input 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async () => {
    if (!image || disabled || loading) return;

    if (!confirm("정말 프로필 이미지를 삭제하시겠습니까?")) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/profile-image", {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "이미지 삭제 중 오류가 발생했습니다");
      }

      setImage(null);
      onImageChange?.(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "이미지 삭제 중 오류가 발생했습니다"
      );
      console.error("이미지 삭제 중 오류:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className={`relative rounded-full overflow-hidden bg-gray-200 flex items-center justify-center cursor-pointer transition-all ${
          loading ? "opacity-50" : ""
        } ${disabled ? "cursor-default" : "hover:opacity-80"}`}
        style={{ width: `${size}px`, height: `${size}px` }}
        onClick={handleImageClick}
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
          <div className="text-gray-400 flex items-center justify-center h-full w-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12"
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
        )}

        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
          </div>
        )}
      </div>

      {!disabled && (
        <>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileChange}
            disabled={loading || disabled}
          />

          {image && (
            <button
              type="button"
              className="absolute bottom-0 right-0 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
              onClick={handleDelete}
              disabled={loading || disabled}
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          )}
        </>
      )}

      {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
    </div>
  );
}
