"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Department } from "@/domain/entities/Department";
import { Position } from "@/domain/entities/Position";

export default function CreateUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 폼 데이터
  const [formData, setFormData] = useState({
    username: "",
    nickname: "",
    password: "",
    confirmPassword: "",
    departmentId: "",
    positionId: "",
  });

  // 선택 목록 데이터
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);

  // 부서, 직급 데이터 가져오기
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        // 부서 목록 가져오기
        const deptResponse = await fetch("/api/departments");
        if (deptResponse.ok) {
          const deptData = await deptResponse.json();
          setDepartments(deptData);
        }

        // 직급 목록 가져오기
        const posResponse = await fetch("/api/positions");
        if (posResponse.ok) {
          const posData = await posResponse.json();
          setPositions(posData);
        }
      } catch (err) {
        console.error("옵션 데이터를 불러오는 중 오류 발생:", err);
      }
    };

    fetchOptions();
  }, []);

  // 입력 필드 변경 처리
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // 폼 제출 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 비밀번호 확인
    if (formData.password !== formData.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다");
      setLoading(false);
      return;
    }

    try {
      // 사용자 생성 API 호출
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // id 필드 제외 - Supabase가 자동 생성
          username: formData.username,
          nickname: formData.nickname,
          password: formData.password,
          departmentId: formData.departmentId
            ? parseInt(formData.departmentId)
            : undefined,
          positionId: formData.positionId
            ? parseInt(formData.positionId)
            : undefined,
          roleId: "02", // 사원 역할 ID 고정
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `오류: ${response.status}`);
      }

      // 성공 시 사용자 목록 페이지로 이동
      alert("사용자가 성공적으로 생성되었습니다");
      router.push("/admin/users");
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "사용자 생성 중 오류가 발생했습니다"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">신규 사용자 등록</h1>
        <Link
          href="/admin/users"
          className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded"
        >
          목록으로 돌아가기
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 사용자명 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                사용자명 *
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                placeholder="사용자명을 입력하세요"
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
                value={formData.nickname}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                placeholder="닉네임을 입력하세요"
              />
            </div>

            {/* 비밀번호 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호 *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                placeholder="비밀번호를 입력하세요"
              />
            </div>

            {/* 비밀번호 확인 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호 확인 *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                placeholder="비밀번호를 다시 입력하세요"
              />
            </div>

            {/* 부서 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                부서
              </label>
              <select
                name="departmentId"
                value={formData.departmentId}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">선택하세요</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
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
                value={formData.positionId}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">선택하세요</option>
                {positions.map((pos) => (
                  <option key={pos.id} value={pos.id}>
                    {pos.positionName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={() => router.push("/admin/users")}
              className="mr-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "처리 중..." : "사용자 등록"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
