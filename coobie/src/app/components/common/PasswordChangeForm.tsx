"use client";

import { useState } from "react";

interface PasswordChangeFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function PasswordChangeForm({
  onSuccess,
  onCancel,
}: PasswordChangeFormProps) {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // 입력 검증
    if (
      !formData.currentPassword ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      setError("모든 필드를 입력해주세요");
      setLoading(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("새 비밀번호가 일치하지 않습니다");
      setLoading(false);
      return;
    }

    if (formData.newPassword === formData.currentPassword) {
      setError("새 비밀번호는 현재 비밀번호와 달라야 합니다");
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 4) {
      setError("비밀번호는 최소 4자 이상이어야 합니다");
      setLoading(false);
      return;
    }

    try {
      // API 호출
      const response = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "비밀번호 변경에 실패했습니다");
      }

      // 성공 처리
      setSuccess(true);
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || "비밀번호 변경 중 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">비밀번호 변경</h3>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
      )}

      {success && (
        <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
          비밀번호가 성공적으로 변경되었습니다!
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* 현재 비밀번호 */}
          <div>
            <label
              htmlFor="currentPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              현재 비밀번호
            </label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-amber-500 focus:border-amber-500"
              disabled={loading}
            />
          </div>

          {/* 새 비밀번호 */}
          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              새 비밀번호
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-amber-500 focus:border-amber-500"
              disabled={loading}
            />
          </div>

          {/* 새 비밀번호 확인 */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              새 비밀번호 확인
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-amber-500 focus:border-amber-500"
              disabled={loading}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded"
              disabled={loading}
            >
              취소
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded"
            disabled={loading}
          >
            {loading ? "처리 중..." : "비밀번호 변경"}
          </button>
        </div>
      </form>
    </div>
  );
}
