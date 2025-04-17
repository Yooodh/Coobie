"use client";

import { useState, useEffect } from "react";
import { User } from "@/domain/entities/User";
import { Department } from "@/domain/entities/Department";
import { Position } from "@/domain/entities/Position";

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("검색옵션");

  // 필터
  const [filters, setFilters] = useState({
    username: "",
    isLocked: undefined as boolean | undefined,
    isApproved: undefined as boolean | undefined,
    roleId: "02", // 기본적으로 role_id가 "02"인 사용자만 표시
  });

  // 부서와 직급 데이터 가져오기
  const fetchDepartmentsAndPositions = async () => {
    try {
      // 부서 데이터 가져오기
      const deptResponse = await fetch("/api/departments");
      if (deptResponse.ok) {
        const deptData = await deptResponse.json();
        setDepartments(deptData);
      }

      // 직급 데이터 가져오기
      const posResponse = await fetch("/api/positions");
      if (posResponse.ok) {
        const posData = await posResponse.json();
        setPositions(posData);
      }
    } catch (err: unknown) {
      console.error("부서 및 직급 데이터 로딩 실패:", err);
    }
  };

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
      if (filters.roleId) {
        queryParams.append("roleId", filters.roleId);
      }

      console.log("API 요청 URL:", `/api/users?${queryParams.toString()}`);
      const response = await fetch(`/api/users?${queryParams.toString()}`);

      if (!response.ok) {
        throw new Error(`오류: ${response.status}`);
      }

      const data = await response.json();
      console.log("API 응답 데이터:", data);

      setUsers(data.users || []);
      setTotalPages(data.totalPages || 1);
    } catch (err: unknown) {
      console.error("API 오류:", err);
      setError(
        err instanceof Error
          ? err.message
          : "사용자 목록을 불러오는데 실패했습니다"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 페이지 로드 시 부서와 직급 데이터 가져오기
    fetchDepartmentsAndPositions();
    fetchUsers();
  }, [currentPage, filters]);

  useEffect(() => {
    console.log("현재 사용자 데이터:", users);
  }, [users]);

  // 부서 ID를 부서 이름으로 변환
  const getDepartmentName = (departmentId: number | undefined): string => {
    if (!departmentId) return "-";
    const department = departments.find((d) => d.id === departmentId);
    return department ? department.departmentName : `부서 ${departmentId}`;
  };

  // 직급 ID를 직급 이름으로 변환
  const getPositionName = (positionId: number | undefined): string => {
    if (!positionId) return "-";
    const position = positions.find((p) => p.id === positionId);
    return position ? position.positionName : `직급 ${positionId}`;
  };

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
      } catch (err: unknown) {
        alert(
          `비밀번호 재설정 실패: ${
            err instanceof Error ? err.message : "알 수 없는 오류"
          }`
        );
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
    } catch (err: unknown) {
      alert(
        `잠금 상태 업데이트 실패: ${
          err instanceof Error ? err.message : "알 수 없는 오류"
        }`
      );
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

        // 삭제 성공 시 UI에서 해당 사용자 즉시 제거
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));

        alert("사용자가 성공적으로 삭제되었습니다");
      } catch (err: unknown) {
        console.error("사용자 삭제 오류:", err);
        alert(
          `사용자 삭제 실패: ${
            err instanceof Error ? err.message : "알 수 없는 오류"
          }`
        );
      }
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({
      ...filters,
      username: searchTerm,
    });
    setCurrentPage(1);
  };

  const tabs = [
    "검색옵션",
    "전체",
    "이름",
    "아이디",
    "직급",
    "소속부서",
    "임시일자",
    "퇴사자",
  ];

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "-";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj
      .toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\. /g, ".")
      .replace(/\.$/, "");
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* 회사 정보 헤더 */}
      <div className="flex items-center mb-6">
        <div className="w-16 h-16 bg-gray-200 rounded-full mr-4"></div>
        <div>
          <h2 className="text-xl font-bold">반갑습니다! 홍길동님</h2>
          <p className="text-gray-600">사업자 번호: 123-45-67890</p>
        </div>
      </div>

      {/* 검색 탭 */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 whitespace-nowrap ${
                activeTab === tab
                  ? "font-bold border-b-2 border-amber-400"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 검색 입력 */}
        <div className="mt-4">
          <form onSubmit={handleSearch} className="flex items-center">
            <div className="mr-2 font-medium">검색명</div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="검색어를 입력해주세요"
              className="flex-1 p-2 border border-gray-300 rounded"
            />
          </form>
        </div>
      </div>

      {/* 오류 메시지 */}
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      {/* 사용자 테이블 */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        {loading ? (
          <div className="text-center py-8">로딩 중...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-3 px-4 text-center">상태</th>
                    <th className="py-3 px-4 text-center">사용자명</th>
                    <th className="py-3 px-4 text-center">닉네임</th>
                    <th className="py-3 px-4 text-center">부서</th>
                    <th className="py-3 px-4 text-center">직급</th>
                    <th className="py-3 px-4 text-center">생성일</th>
                    <th className="py-3 px-4 text-center text-red-500">삭제</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-10 text-center text-gray-500"
                      >
                        사용자 정보가 없습니다
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="py-4 px-4 text-center">
                          <div className="flex justify-center">
                            <button
                              onClick={() =>
                                toggleLockStatus(user.id, user.isLocked)
                              }
                              className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center"
                            >
                              {user.isLocked ? (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                  className="w-4 h-4 text-red-500"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                  className="w-4 h-4 text-green-500"
                                >
                                  <path d="M18 1.5c2.9 0 5.25 2.35 5.25 5.25v3.75a.75.75 0 01-1.5 0V6.75a3.75 3.75 0 10-7.5 0v3a3 3 0 013 3v6.75a3 3 0 01-3 3H3.75a3 3 0 01-3-3v-6.75a3 3 0 013-3h9v-3c0-2.9 2.35-5.25 5.25-5.25z" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          {user.username}
                        </td>
                        <td className="py-4 px-4 text-center">
                          {user.nickname}
                        </td>
                        <td className="py-4 px-4 text-center">
                          {getDepartmentName(user.departmentId)}
                        </td>
                        <td className="py-4 px-4 text-center">
                          {getPositionName(user.positionId)}
                        </td>
                        <td className="py-4 px-4 text-center">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() => deleteUser(user.id)}
                            className="text-red-500 hover:text-red-700 font-medium"
                          >
                            삭제
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <div className="flex space-x-1 items-center">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-gray-700"
                  >
                    이전
                  </button>

                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        currentPage === i + 1
                          ? "bg-amber-400 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-gray-700"
                  >
                    다음
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
