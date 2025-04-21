"use client";

import { useState, useEffect } from "react";

export default function UserManagementPage({
  fetchUsersUseCase,
  fetchDepartmentsAndPositionsUseCase,
  toggleLockStatusUseCase,
  deleteUserUseCase,
}) {
  const [users, setUsers] = useState<{ id: string; username: string; nickname: string; departmentId: string; positionId: string; createdAt: string; isLocked: boolean }[]>([]);
  const [departments, setDepartments] = useState<{ id: string; departmentName: string }[]>([]);
  const [positions, setPositions] = useState<{ id: string; positionName: string }[]>([]);
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch departments and positions
        const { departments, positions } =
          await fetchDepartmentsAndPositionsUseCase.execute();
        setDepartments(departments);
        setPositions(positions);

        // Fetch users
        const { users, totalPages } = await fetchUsersUseCase.execute(
          filters,
          currentPage
        );
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
          <h2 className="text-xl font-bold">반갑습니다! 홍길동님</h2>
          <p className="text-gray-600">사업자 번호: 123-45-67890</p>
        </div>
      </div>

      {/* 검색 탭 */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <form onSubmit={handleSearch} className="flex items-center">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="검색어를 입력해주세요"
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
                          onClick={() =>
                            handleToggleLockStatus(user.id, user.isLocked)
                          }
                          className="text-blue-500 hover:text-blue-700"
                        >
                          {user.isLocked ? "잠금 해제" : "잠금"}
                        </button>
                      </td>
                      <td className="py-4 px-4 text-center">{user.username}</td>
                      <td className="py-4 px-4 text-center">{user.nickname}</td>
                      <td className="py-4 px-4 text-center">
                        {departments.find((d) => d.id === user.departmentId)
                          ?.departmentName || "-"}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {positions.find((p) => p.id === user.positionId)
                          ?.positionName || "-"}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-500 hover:text-red-700"
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