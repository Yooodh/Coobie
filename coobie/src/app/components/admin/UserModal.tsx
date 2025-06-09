"use client";

import { useState, useEffect } from "react";
import { UserListDto } from "@/application/usecases/user/dto/UserListDto";
import { DepartmentDto } from "@/application/usecases/admin/dto/DepartmentDto";
import { PositionDto } from "@/application/usecases/admin/dto/PositionDto";

interface UserModalProps {
  user: UserListDto | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedUser: Partial<UserListDto>) => Promise<void>;
  departments: DepartmentDto[];
  positions: PositionDto[];
}

export default function UserModal({
  user,
  isOpen,
  onClose,
  onSave,
  departments,
  positions,
}: UserModalProps) {
  const [formData, setFormData] = useState<Partial<UserListDto>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 사용자 데이터가 변경될 때 폼 데이터 초기화
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        nickname: user.nickname,
        departmentId: user.departmentId,
        positionId: user.positionId,
        isLocked: user.isLocked,
        isApproved: user.isApproved,
        notificationOn: user.notificationOn,
      });
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const updatedFormData: Partial<UserListDto> = {
        ...formData,
      };

      // 숫자 타입으로 변환
      if (formData.departmentId) {
        updatedFormData.departmentId = Number(formData.departmentId);
      }

      if (formData.positionId) {
        updatedFormData.positionId = Number(formData.positionId);
      }

      await onSave(updatedFormData);
      onClose();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "사용자 정보 업데이트 중 오류가 발생했습니다"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">사용자 정보 수정</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* 사용자명 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                사용자명 *
              </label>
              <input
                type="text"
                name="username"
                value={formData.username || ""}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* 닉네임 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                닉네임 *
              </label>
              <input
                type="text"
                name="nickname"
                value={formData.nickname || ""}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* 부서 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                부서
              </label>
              <select
                name="departmentId"
                value={formData.departmentId?.toString() || ""}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">선택하세요</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id.toString()}>
                    {dept.departmentName}
                  </option>
                ))}
              </select>
            </div>

            {/* 직급 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                직급
              </label>
              <select
                name="positionId"
                value={formData.positionId?.toString() || ""}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">선택하세요</option>
                {positions.map((pos) => (
                  <option key={pos.id} value={pos.id.toString()}>
                    {pos.positionName}
                  </option>
                ))}
              </select>
            </div>

            {/* 계정 상태 체크박스 */}
            <div className="flex flex-col space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isLocked"
                  id="isLocked"
                  checked={formData.isLocked || false}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="isLocked"
                  className="ml-2 block text-sm text-gray-700"
                >
                  계정 잠금
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isApproved"
                  id="isApproved"
                  checked={formData.isApproved || false}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="isApproved"
                  className="ml-2 block text-sm text-gray-700"
                >
                  계정 승인
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="notificationOn"
                  id="notificationOn"
                  checked={formData.notificationOn || false}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="notificationOn"
                  className="ml-2 block text-sm text-gray-700"
                >
                  알림 활성화
                </label>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "저장 중..." : "저장"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
