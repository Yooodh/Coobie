"use client";

import { useState, useEffect } from "react";
import CategoryInput from "@/app/components/admin/CategortInput";

interface Department {
  id: number;
  departmentName: string;
}

interface Position {
  id: number;
  positionName: string;
}

export default function SettingsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 부서 및 직급 데이터 가져오기
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 부서 목록 가져오기
      const deptResponse = await fetch("/api/departments");
      if (!deptResponse.ok) {
        throw new Error(
          `부서 정보를 불러오는데 실패했습니다: ${deptResponse.status}`
        );
      }
      const deptData = await deptResponse.json();

      // 직급 목록 가져오기
      const posResponse = await fetch("/api/positions");
      if (!posResponse.ok) {
        throw new Error(
          `직급 정보를 불러오는데 실패했습니다: ${posResponse.status}`
        );
      }
      const posData = await posResponse.json();

      // 부서 데이터 형식 변환
      const formattedDepartments = deptData.map((dept: any) => ({
        id: dept.id,
        departmentName: dept.departmentName,
      }));

      // 직급 데이터 형식 변환
      const formattedPositions = posData.map((pos: any) => ({
        id: pos.id,
        positionName: pos.positionName,
      }));

      setDepartments(formattedDepartments);
      setPositions(formattedPositions);
    } catch (err: any) {
      console.error("데이터 불러오기 실패:", err);
      setError(err.message || "데이터를 불러오는데 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  // 초기 데이터 로딩
  useEffect(() => {
    fetchData();
  }, []);

  // 부서 추가
  const handleAddDepartment = async (name: string) => {
    try {
      const response = await fetch("/api/departments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ departmentName: name }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `오류: ${response.status}`);
      }

      // 추가 성공 후, 데이터 새로고침 대신 반환된 부서 데이터를 사용하여 상태 업데이트
      const newDepartment = await response.json();
      setDepartments(prev => [...prev, {
        id: newDepartment.id, 
        departmentName: newDepartment.departmentName
      }]);
      
      return Promise.resolve();
    } catch (err: any) {
      console.error("부서 추가 실패:", err);
      return Promise.reject(new Error(err.message || "부서 추가에 실패했습니다"));
    }
  };

  // 직급 추가
  const handleAddPosition = async (name: string) => {
    try {
      const response = await fetch("/api/positions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ positionName: name }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `오류: ${response.status}`);
      }

      // 추가 성공 후, 데이터 새로고침 대신 반환된 직급 데이터를 사용하여 상태 업데이트
      const newPosition = await response.json();
      setPositions(prev => [...prev, {
        id: newPosition.id, 
        positionName: newPosition.positionName
      }]);
      
      return Promise.resolve();
    } catch (err: any) {
      console.error("직급 추가 실패:", err);
      return Promise.reject(new Error(err.message || "직급 추가에 실패했습니다"));
    }
  };

  // 부서 삭제
  const handleDeleteDepartment = async (id: number) => {
    try {
      const response = await fetch(`/api/departments/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `오류: ${response.status}`);
      }

      // 삭제 성공 시 해당 부서를 상태에서 제거
      setDepartments(prev => prev.filter(dept => dept.id !== id));
      return Promise.resolve();
    } catch (err: any) {
      console.error("부서 삭제 실패:", err);
      return Promise.reject(new Error(err.message || "부서 삭제에 실패했습니다"));
    }
  };

  // 직급 삭제
  const handleDeletePosition = async (id: number) => {
    try {
      const response = await fetch(`/api/positions/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `오류: ${response.status}`);
      }

      // 삭제 성공 시 해당 직급을 상태에서 제거
      setPositions(prev => prev.filter(pos => pos.id !== id));
      return Promise.resolve();
    } catch (err: any) {
      console.error("직급 삭제 실패:", err);
      return Promise.reject(new Error(err.message || "직급 삭제에 실패했습니다"));
    }
  };

  // 비밀번호 변경 처리
  const handlePasswordChange = () => {
    alert("준비 중인 기능입니다. 추후 업데이트 될 예정입니다.");
  };

  // 사용자 정보 확인 (디버깅용)
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/auth/me");
        const userData = await response.json();
        console.log("현재 로그인 사용자 정보:", userData);
      } catch (err) {
        console.error("사용자 정보 조회 실패:", err);
      }
    };
    
    fetchUserData();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">설정</h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-4 text-gray-700">로딩 중...</p>
        </div>
      ) : (
        <>
          {/* 부서 설정 */}
          <CategoryInput
            title="부서 관리"
            items={departments.map((dept) => ({
              id: dept.id,
              name: dept.departmentName,
            }))}
            onAdd={handleAddDepartment}
            onDelete={handleDeleteDepartment}
            placeholderText="부서명 입력 후 엔터"
          />

          {/* 직급 설정 */}
          <CategoryInput
            title="직급 관리"
            items={positions.map((pos) => ({
              id: pos.id,
              name: pos.positionName,
            }))}
            onAdd={handleAddPosition}
            onDelete={handleDeletePosition}
            placeholderText="직급명 입력 후 엔터"
          />

          {/* 비밀번호 변경 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">계정 설정</h3>
            <button
              onClick={handlePasswordChange}
              className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2 rounded"
            >
              비밀번호 재설정
            </button>
          </div>
        </>
      )}
    </div>
  );
}