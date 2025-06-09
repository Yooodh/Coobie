"use client";

import { useState, useEffect } from "react";
import SearchTabs from "@/app/components/admin/SearchTabs";
import UserTable from "@/app/components/admin/UserTable";
import UserModal from "@/app/components/admin/UserModal";
import { LogoutUseCase } from "@/application/usecases/auth/LogoutUseCase";
import { AuthUserDto } from "@/application/usecases/auth/dto/AuthUserDto";
import { UserListDto } from "@/application/usecases/user/dto/UserListDto";
import { DepartmentDto } from "@/application/usecases/admin/dto/DepartmentDto";
import { PositionDto } from "@/application/usecases/admin/dto/PositionDto";

interface ApiError {
  error: string;
}

interface UsersApiResponse {
  users: UserListDto[];
  total: number;
  totalPages: number;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserListDto[]>([]);
  const [departments, setDepartments] = useState<DepartmentDto[]>([]);
  const [positions, setPositions] = useState<PositionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("전체");
  const [loggingOut, setLoggingOut] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUserDto | null>(null);

  // 모달 관련 상태 추가
  const [selectedUser, setSelectedUser] = useState<UserListDto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 현재 로그인한 사용자 정보 가져오기
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (!response.ok) {
          throw new Error("인증된 사용자 정보를 가져오는데 실패했습니다");
        }
        const data = await response.json();
        setCurrentUser(data.user);
      } catch (err) {
        console.error("사용자 정보를 불러오는 중 오류 발생:", err);
        setError("사용자 정보를 불러오는데 실패했습니다.");
      }
    };
    fetchCurrentUser();
  }, []);

  // 사용자 목록 가져오기
  const fetchUsers = async () => {
    if (!currentUser || !currentUser.businessNumber) {
      console.error("사업자 번호를 가져올 수 없습니다.");
      return;
    }

    setLoading(true);
    try {
      const queryParams = new URLSearchParams();

      // 페이지네이션 추가
      queryParams.append("page", currentPage.toString());
      queryParams.append("limit", "10");

      // 역할 ID 고정 (일반 사용자만)
      queryParams.append("roleId", "02");

      queryParams.append("businessNumber", currentUser.businessNumber);

      console.log("요청 URL:", `/api/users?${queryParams.toString()}`);

      // 필터 추가
      if (searchTerm) {
        if (searchType === "이름") {
          queryParams.append("nickname", searchTerm);
        } else if (searchType === "아이디") {
          queryParams.append("username", searchTerm);
        } else {
          // 전체 검색
          queryParams.append("username", searchTerm);
        }
      }

      const response = await fetch(`/api/users?${queryParams.toString()}`);

      if (!response.ok) {
        throw new Error(`오류: ${response.status}`);
      }

      const data = (await response.json()) as UsersApiResponse;
      console.log("사용자 데이터:", data);
      setUsers(data.users);
      setTotalPages(data.totalPages);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "사용자 목록을 불러오는데 실패했습니다");
      } else {
        setError("사용자 목록을 불러오는데 실패했습니다");
      }
    } finally {
      setLoading(false);
    }
  };

  // 현재 사용자 정보가 변경될 때 사용자 목록 다시 가져오기
  useEffect(() => {
    if (currentUser && currentUser.businessNumber) {
      fetchDepartmentsAndPositions();
      fetchUsers();
    }
  }, [currentUser, currentPage, searchTerm, searchType]);

  // 부서 및 직급 정보 가져오기
  const fetchDepartmentsAndPositions = async () => {
    try {
      // 부서 및 직급 정보 가져오기
      const [deptResponse, posResponse] = await Promise.all([
        fetch("/api/departments", {
          headers: {
            "Cache-Control": "no-cache", // 캐시 방지
          },
        }),
        fetch("/api/positions", {
          headers: {
            "Cache-Control": "no-cache", // 캐시 방지
          },
        }),
      ]);

      if (deptResponse.ok) {
        const deptData = (await deptResponse.json()) as DepartmentDto[];
        console.log("부서 데이터:", deptData);
        setDepartments(deptData);
      } else {
        console.error(
          "부서 정보를 가져오는데 실패했습니다:",
          await deptResponse.text()
        );
      }

      if (posResponse.ok) {
        const posData = (await posResponse.json()) as PositionDto[];
        console.log("직급 데이터:", posData);
        setPositions(posData);
      } else {
        console.error(
          "직급 정보를 가져오는데 실패했습니다:",
          await posResponse.text()
        );
      }
    } catch (err) {
      console.error("부서/직급 정보를 불러오는 중 오류 발생:", err);
    }
  };

  const handleSearch = (term: string, type: string) => {
    setSearchTerm(term);
    setSearchType(type);
    setCurrentPage(1);
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
          const errorData = (await response.json()) as ApiError;
          throw new Error(errorData.error || `오류: ${response.status}`);
        }

        alert("비밀번호가 성공적으로 초기화되었습니다");
        fetchUsers(); // 목록 새로고침
      } catch (err) {
        if (err instanceof Error) {
          alert(`비밀번호 초기화 실패: ${err.message}`);
        } else {
          alert("비밀번호 초기화 실패");
        }
      }
    }
  };

  const toggleLockStatus = async (userId: string, currentStatus: boolean) => {
    if (currentStatus) {
      // 잠금된 상태면 바로 비밀번호 초기화
      await resetPassword(userId);
    } else {
      // 정상 상태면 잠금 상태로 변경
      try {
        const response = await fetch(`/api/users/${userId}/lock-status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isLocked: true }),
        });

        if (!response.ok) {
          const errorData = (await response.json()) as ApiError;
          throw new Error(errorData.error || `오류: ${response.status}`);
        }

        alert("사용자 계정이 잠금 설정되었습니다");
        fetchUsers(); // 목록 새로고침
      } catch (err) {
        if (err instanceof Error) {
          alert(`잠금 상태 변경 실패: ${err.message}`);
        } else {
          alert("잠금 상태 변경 실패");
        }
      }
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
          const errorData = (await response.json()) as ApiError;
          throw new Error(errorData.error || `오류: ${response.status}`);
        }

        alert("사용자가 성공적으로 삭제되었습니다");
        fetchUsers(); // 목록 새로고침
      } catch (err) {
        if (err instanceof Error) {
          alert(`사용자 삭제 실패: ${err.message}`);
        } else {
          alert("사용자 삭제 실패");
        }
      }
    }
  };

  // 모달 관련 함수 추가
  const handleEditUser = (user: UserListDto) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
  };

  interface UpdatedUserData {
    username?: string;
    nickname?: string;
    departmentId?: number | null;
    positionId?: number | null;
    isLocked?: boolean;
    isApproved?: boolean;
    notificationOn?: boolean;
  }

  const handleSaveUser = async (updatedUser: Partial<UserListDto>) => {
    if (!selectedUser) return;

    try {
      // API 호출 데이터 준비
      const userData: UpdatedUserData = {
        username: updatedUser.username,
        nickname: updatedUser.nickname,
        departmentId:
          updatedUser.departmentId !== undefined
            ? updatedUser.departmentId
            : null,
        positionId:
          updatedUser.positionId !== undefined ? updatedUser.positionId : null,
        isLocked: updatedUser.isLocked,
        isApproved: updatedUser.isApproved,
        notificationOn: updatedUser.notificationOn,
      };

      // API 호출
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as ApiError;
        throw new Error(errorData.error || `오류: ${response.status}`);
      }

      alert("사용자 정보가 성공적으로 업데이트되었습니다");
      fetchUsers(); // 목록 새로고침
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(err.message || "사용자 정보 업데이트에 실패했습니다");
      } else {
        throw new Error("사용자 정보 업데이트에 실패했습니다");
      }
    }
  };

  const handleLogout = async () => {
    if (confirm("정말 로그아웃 하시겠습니까?")) {
      try {
        setLoggingOut(true);
        const logoutUseCase = new LogoutUseCase();
        const success = await logoutUseCase.execute();

        if (success) {
          // 클라이언트 측 라우팅 (useRouter 사용)
          window.location.href = "/"; // 리다이렉션을 window.location으로 변경
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message || "로그아웃 중 오류가 발생했습니다");
        } else {
          setError("로그아웃 중 오류가 발생했습니다");
        }
      } finally {
        setLoggingOut(false);
      }
    }
  };

  console.log("currentUser:", currentUser);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* 회사 관리자 정보 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full mr-4"></div>
          <div>
            <h2 className="text-xl font-bold">
              반갑습니다! {currentUser?.nickname || "관리자"}님
            </h2>
            <p className="text-gray-600">사원 관리</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md transition-colors"
        >
          {loggingOut ? "로그아웃 중..." : "로그아웃"}
        </button>
      </div>

      {/* 검색 탭 */}
      <SearchTabs onSearch={handleSearch} />

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md my-6">
          {error}
        </div>
      )}

      {/* 사용자 테이블 */}
      <div className="bg-white rounded-lg shadow-sm p-4 mt-6">
        {loading ? (
          <div className="text-center py-8">로딩 중...</div>
        ) : (
          <>
            <UserTable
              users={users}
              departments={departments}
              positions={positions}
              onResetPassword={resetPassword}
              onToggleLock={toggleLockStatus}
              onDeleteUser={deleteUser}
              onEditUser={handleEditUser}
            />

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

      {/* 사용자 정보 수정 모달 */}
      {selectedUser && (
        <UserModal
          user={selectedUser}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveUser}
          departments={departments}
          positions={positions}
        />
      )}
    </div>
  );
}
