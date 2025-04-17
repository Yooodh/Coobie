"use client";

import { useState, useEffect } from "react";
import { User } from "@/domain/entities/User";
import Link from "next/link";

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 필터
  const [filters, setFilters] = useState({
    username: "",
    isLocked: undefined as boolean | undefined,
    isApproved: undefined as boolean | undefined,
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();

      // 페이지네이션 추가
      queryParams.append("page", currentPage.toString());
      queryParams.append("limit", "10");

      // 필터 추가
      if (filters.username) {
        queryParams.append("username", filters.username);
      }
      if (filters.isLocked !== undefined) {
        queryParams.append("isLocked", filters.isLocked.toString());
      }
      if (filters.isApproved !== undefined) {
        queryParams.append("isApproved", filters.isApproved.toString());
      }

      const response = await fetch(`/api/users?${queryParams.toString()}`);

      if (!response.ok) {
        throw new Error(`오류: ${response.status}`);
      }

      const data = await response.json();
      setUsers(data.users);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      setError(err.message || "사용자 목록을 불러오는데 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, filters]);

  const resetPassword = async (userId: string) => {
    if (confirm("정말 이 사용자의 비밀번호를 초기화하시겠습니까?")) {
      try {
        const response = await fetch(`/api/users/${userId}/reset-password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ defaultPassword: "0000" }),
        });

        if (!response.ok) {
          throw new Error(`오류: ${response.status}`);
        }

        alert("비밀번호가 성공적으로 재설정되었습니다");
        fetchUsers(); // 목록 새로고침
      } catch (err: any) {
        alert(`비밀번호 재설정 실패: ${err.message}`);
      }
    }
  };

  const toggleLockStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/users/${userId}/lock-status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isLocked: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error(`오류: ${response.status}`);
      }

      alert(
        `사용자가 성공적으로 ${!currentStatus ? "잠금" : "잠금 해제"}되었습니다`
      );
      fetchUsers(); // 목록 새로고침
    } catch (err: any) {
      alert(`잠금 상태 업데이트 실패: ${err.message}`);
    }
  };

  const deleteUser = async (userId: string) => {
    if (
      confirm(
        "정말 이 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
      )
    ) {
      try {
        const response = await fetch(`/api/users/${userId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error(`오류: ${response.status}`);
        }

        alert("사용자가 성공적으로 삭제되었습니다");
        fetchUsers(); // 목록 새로고침
      } catch (err: any) {
        alert(`사용자 삭제 실패: ${err.message}`);
      }
    }
  };

  const handleFilterChange = (name: string, value: any) => {
    setFilters({
      ...filters,
      [name]: value,
    });
    setCurrentPage(1); // 필터 변경 시 첫 페이지로 리셋
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">사용자 관리</h1>

      {/* 필터 */}
      <div className="bg-gray-100 p-4 rounded-md mb-6">
        <h2 className="text-lg font-semibold mb-2">필터</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              사용자명
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={filters.username}
              onChange={(e) => handleFilterChange("username", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              잠금 상태
            </label>
            <select
              className="w-full p-2 border rounded"
              value={
                filters.isLocked === undefined
                  ? ""
                  : filters.isLocked.toString()
              }
              onChange={(e) => {
                const value =
                  e.target.value === "" ? undefined : e.target.value === "true";
                handleFilterChange("isLocked", value);
              }}
            >
              <option value="">전체</option>
              <option value="true">잠금</option>
              <option value="false">정상</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              승인 상태
            </label>
            <select
              className="w-full p-2 border rounded"
              value={
                filters.isApproved === undefined
                  ? ""
                  : filters.isApproved.toString()
              }
              onChange={(e) => {
                const value =
                  e.target.value === "" ? undefined : e.target.value === "true";
                handleFilterChange("isApproved", value);
              }}
            >
              <option value="">전체</option>
              <option value="true">승인됨</option>
              <option value="false">미승인</option>
            </select>
          </div>
        </div>
      </div>

      {/* 사용자 생성 버튼 */}
      <div className="mb-6">
        <Link
          href="/admin/users/create"
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
        >
          신규 사용자 등록
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">로딩 중...</div>
      ) : (
        <>
          {/* 사용자 테이블 */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border">ID</th>
                  <th className="py-2 px-4 border">사용자명</th>
                  <th className="py-2 px-4 border">닉네임</th>
                  <th className="py-2 px-4 border">부서</th>
                  <th className="py-2 px-4 border">직급</th>
                  <th className="py-2 px-4 border">상태</th>
                  <th className="py-2 px-4 border">잠금 상태</th>
                  <th className="py-2 px-4 border">승인 상태</th>
                  <th className="py-2 px-4 border">작업</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-4 px-4 border text-center">
                      사용자가 없습니다
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border">{user.id}</td>
                      <td className="py-2 px-4 border">{user.username}</td>
                      <td className="py-2 px-4 border">{user.nickname}</td>
                      <td className="py-2 px-4 border">
                        {user.departmentId || "없음"}
                      </td>
                      <td className="py-2 px-4 border">
                        {user.positionId || "없음"}
                      </td>
                      {/* <td className="py-2 px-4 border">
                        {translateStatus(user.status)}
                      </td> */}
                      <td className="py-2 px-4 border">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            user.isLocked
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {user.isLocked ? "잠금" : "정상"}
                        </span>
                      </td>
                      <td className="py-2 px-4 border">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            user.isApproved
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {user.isApproved ? "승인됨" : "대기 중"}
                        </span>
                      </td>
                      <td className="py-2 px-4 border">
                        <div className="flex space-x-2">
                          <Link
                            href={`/admin/users/${user.id}`}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            보기
                          </Link>
                          <Link
                            href={`/admin/users/${user.id}/edit`}
                            className="text-green-500 hover:text-green-700"
                          >
                            수정
                          </Link>
                          <button
                            onClick={() => resetPassword(user.id!)}
                            className="text-orange-500 hover:text-orange-700"
                          >
                            비밀번호 초기화
                          </button>
                          <button
                            onClick={() =>
                              toggleLockStatus(user.id!, user.isLocked)
                            }
                            className="text-purple-500 hover:text-purple-700"
                          >
                            {user.isLocked ? "잠금 해제" : "잠금"}
                          </button>
                          <button
                            onClick={() => deleteUser(user.id!)}
                            className="text-red-500 hover:text-red-700"
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded ${
                    currentPage === 1
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  이전
                </button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 rounded ${
                          currentPage === page
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 hover:bg-gray-300"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded ${
                    currentPage === totalPages
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  다음
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// 상태 텍스트 번역 함수
function translateStatus(
  status?: "online" | "offline" | "busy" | "away"
): string {
  switch (status) {
    case "online":
      return "온라인";
    case "offline":
      return "오프라인";
    case "busy":
      return "바쁨";
    case "away":
      return "자리비움";
    default:
      return "오프라인";
  }
}