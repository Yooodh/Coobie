"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User } from "@/domain/entities/User";

interface Department {
  id: number;
  departmentName: string;
}

interface Position {
  id: number;
  positionName: string;
}

interface Role {
  id: string;
  roleName: string;
}

export default function EditUserPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 폼 데이터
  const [formData, setFormData] = useState({
    username: "",
    nickname: "",
    departmentId: "",
    positionId: "",
    roleId: "",
    isLocked: false,
    isApproved: false,
    notificationOn: true,
  });
  
  // 선택 목록 데이터
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);

  // 데이터 로딩
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 사용자 정보 가져오기
        const userResponse = await fetch(`/api/users/${params.id}`);
        if (!userResponse.ok) {
          throw new Error(`사용자 정보를 불러올 수 없습니다: ${userResponse.status}`);
        }
        
        const userData: User = await userResponse.json();
        
        // 폼 데이터 설정
        setFormData({
          username: userData.username,
          nickname: userData.nickname,
          departmentId: userData.departmentId?.toString() || "",
          positionId: userData.positionId?.toString() || "",
          roleId: userData.roleId,
          isLocked: userData.isLocked,
          isApproved: userData.isApproved,
          notificationOn: userData.notificationOn,
        });
        
        // 부서, 직급, 역할 데이터 가져오기
        const [deptResponse, posResponse, roleResponse] = await Promise.all([
          fetch('/api/departments'),
          fetch('/api/positions'),
          fetch('/api/roles')
        ]);
        
        if (deptResponse.ok) {
          const deptData = await deptResponse.json();
          setDepartments(deptData);
        }
        
        if (posResponse.ok) {
          const posData = await posResponse.json();
          setPositions(posData);
        }
        
        if (roleResponse.ok) {
          const roleData = await roleResponse.json();
          setRoles(roleData);
        }
      } catch (err: any) {
        setError(err.message || "사용자 정보를 불러오는 중 오류가 발생했습니다");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [params.id]);

  // 입력 필드 변경 처리
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // 체크박스 변경 처리
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked,
    });
  };

  // 폼 제출 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      // 사용자 정보 업데이트 API 호출
      const response = await fetch(`/api/users/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          nickname: formData.nickname,
          departmentId: formData.departmentId ? parseInt(formData.departmentId) : null,
          positionId: formData.positionId ? parseInt(formData.positionId) : null,
          roleId: formData.roleId,
          isLocked: formData.isLocked,
          isApproved: formData.isApproved,
          notificationOn: formData.notificationOn,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `오류: ${response.status}`);
      }
      
      // 성공 시 상세 정보 페이지로 이동
      alert("사용자 정보가 성공적으로 업데이트되었습니다");
      router.push(`/admin/users/${params.id}`);
    } catch (err: any) {
      setError(err.message || "사용자 정보 업데이트 중 오류가 발생했습니다");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">사용자 정보 수정</h1>
        <Link 
          href={`/admin/users/${params.id}`}
          className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded"
        >
          상세 정보로 돌아가기
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
            
            {/* 역할 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                역할 *
              </label>
              <select
                name="roleId"
                value={formData.roleId}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">선택하세요</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.roleName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 계정 상태 체크박스 */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isLocked"
                id="isLocked"
                checked={formData.isLocked}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isLocked" className="ml-2 block text-sm text-gray-700">
                계정 잠금
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isApproved"
                id="isApproved"
                checked={formData.isApproved}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isApproved" className="ml-2 block text-sm text-gray-700">
                계정 승인
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="notificationOn"
                id="notificationOn"
                checked={formData.notificationOn}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="notificationOn" className="ml-2 block text-sm text-gray-700">
                알림 활성화
              </label>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <Link
              href={`/admin/users/${params.id}`}
              className="mr-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className={`bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded ${
                submitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {submitting ? "처리 중..." : "저장"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}