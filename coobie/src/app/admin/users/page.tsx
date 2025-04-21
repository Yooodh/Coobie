// src/app/admin/users/page.tsx
"use client";

import { useState, useEffect } from "react";
import { SbUserRepository } from "@/infra/repositories/supabase/SbUserRepository";
import { SbDepartmentRepository } from "@/infra/repositories/supabase/SbDepartmentRepository";
import { SbPositionRepository } from "@/infra/repositories/supabase/SbPositionRepository";
import { FetchUsersUseCase } from "@/application/usecases/admin/FetchUsersUseCase";
import { FetchDepartmentsAndPositionsUseCase } from "@/application/usecases/admin/FetchDepartmentsAndPositionsUseCase";
import { ToggleLockStatusUseCase } from "@/application/usecases/admin/ToggleLockStatusUseCase";
import { DeleteUserUseCase } from "@/application/usecases/admin/DeleteUserUseCase";
import { UserFilter } from "@/domain/repositories/filters/UserFilter";

export default function UserManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    username: "",
    isLocked: undefined,
    isApproved: undefined,
    roleId: "02",
  });
  const [searchTerm, setSearchTerm] = useState("");

  // 유스케이스 초기화
  const userRepository = new SbUserRepository();
  const departmentRepository = new SbDepartmentRepository();
  const positionRepository = new SbPositionRepository();
  
  const fetchUsersUseCase = new FetchUsersUseCase(userRepository);
  const fetchDepartmentsAndPositionsUseCase = new FetchDepartmentsAndPositionsUseCase(
    departmentRepository,
    positionRepository
  );
  const toggleLockStatusUseCase = new ToggleLockStatusUseCase(userRepository);
  const deleteUserUseCase = new DeleteUserUseCase(userRepository);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 현재 로그인한 사용자의 회사 ID 가져오기
        const authResponse = await fetch("/api/auth/me");
        const authData = await authResponse.json();
        const companyId = authData.user.businessNumber; // 사용자의 businessNumber를 회사 ID로 사용

        // 부서와 직급 정보 가져오기
        const { departments, positions } = await fetchDepartmentsAndPositionsUseCase.execute(companyId);
        setDepartments(departments);
        setPositions(positions);

        // 사용자 목록 가져오기
        const userFilter = new UserFilter(
          filters.username,
          undefined,
          undefined,
          undefined,
          undefined,
          filters.roleId,
          filters.isLocked,
          filters.isApproved
        );

        const { users, totalPages } = await fetchUsersUseCase.execute(userFilter, currentPage);
        setUsers(users);
        setTotalPages(totalPages);
      } catch (err) {
        setError(err instanceof Error ? err.message : "데이터 로딩 실패");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters, currentPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prevFilters) => ({
      ...prevFilters,
      username: searchTerm,
    }));
    setCurrentPage(1);
  };

  const handleToggleLockStatus = async (userId: string, isLocked: boolean) => {
    try {
      await toggleLockStatusUseCase.execute(userId, isLocked);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, isLocked: !isLocked } : user
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "잠금 상태 변경 실패");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUserUseCase.execute(userId);
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "사용자 삭제 실패");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* 회사 정보 헤더 */}
      <div className="flex items-center mb-6">
        <div className="w-16 h-16 bg-gray-200 rounded-full mr-4"></div>
        <div>
          <h2 className="text-xl font-bold">반갑습니다! 관리자님</h2>
          <p className="text-gray-600">회사 사용자 관리</p>
        </div>
      </div>

      {/* 검색 폼 */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <form onSubmit={handleSearch} className="flex items-center">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="사용자 이름으로 검색"
            className="flex-1 p-2 border border-gray-300 rounded"
          />
          <button
            type="submit"
            className="ml-2 px-4 py-2 bg-blue-500 text-white rounded"
          >
            검색
          </button>
        </form>
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
                    <td colSpan={7} className="py-10 text-center text-gray-500">
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
                        <button
                          onClick={() => handleToggleLockStatus(user.id, user.isLocked)}
                          className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center"
                        >
                          {user.isLocked ? (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-red-500">
                              <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-green-500">
                              <path d="M18 1.5c2.9 0 5.25 2.35 5.25 5.25v3.75a.75.75 0 01-1.5 0V6.75a3.75 3.75 0 10-7.5 0v3a3 3 0 013 3v6.75a3 3 0 01-3 3H3.75a3 3 0 01-3-3v-6.75a3 3 0 013-3h9v-3c0-2.9 2.35-5.25 5.25-5.25z" />
                            </svg>
                          )}
                        </button>
                      </td>
                      <td className="py-4 px-4 text-center">{user.username}</td>
                      <td className="py-4 px-4 text-center">{user.nickname}</td>
                      <td className="py-4 px-4 text-center">
                        {departments.find((d) => d.id === user.departmentId)?.departmentName || "-"}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {positions.find((p) => p.id === user.positionId)?.positionName || "-"}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleDeleteUser(user.id)}
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
        )}
      </div>
    </div>
  );
}