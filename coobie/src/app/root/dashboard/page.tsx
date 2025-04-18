// src/app/root/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Company {
  id: string;
  companyName: string;
  businessNumber: string;
  isLocked: boolean;
  isApproved: boolean;
  createdAt: string;
}

export default function RootDashboard() {
  const router = useRouter();
  const [pendingCompanies, setPendingCompanies] = useState<Company[]>([]);
  const [approvedCompanies, setApprovedCompanies] = useState<Company[]>([]);
  const [activeTab, setActiveTab] = useState<"pending" | "approved">("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 승인 대기 중인 회사 목록 가져오기
        const pendingResponse = await fetch("/api/companies?isApproved=false");
        
        // 승인된 회사 목록 가져오기
        const approvedResponse = await fetch("/api/companies?isApproved=true");
        
        if (!pendingResponse.ok || !approvedResponse.ok) {
          throw new Error("데이터를 불러오는데 실패했습니다");
        }
        
        const pendingData = await pendingResponse.json();
        const approvedData = await approvedResponse.json();
        
        setPendingCompanies(pendingData.companies || []);
        setApprovedCompanies(approvedData.companies || []);
      } catch (err: any) {
        setError(err.message || "데이터를 불러오는 중 오류가 발생했습니다");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleApprove = async (companyId: string) => {
    try {
      const response = await fetch(`/api/companies/${companyId}/approve`, {
        method: "PATCH",
      });
      
      if (!response.ok) {
        throw new Error("회사 승인에 실패했습니다");
      }
      
      // 목록 업데이트
      const approvedCompany = pendingCompanies.find(company => company.id === companyId);
      if (approvedCompany) {
        setPendingCompanies(prev => prev.filter(company => company.id !== companyId));
        setApprovedCompanies(prev => [...prev, {...approvedCompany, isApproved: true}]);
      }
      
      alert("회사가 성공적으로 승인되었습니다");
    } catch (err: any) {
      alert(err.message || "회사 승인 중 오류가 발생했습니다");
    }
  };

  const handleReject = async (companyId: string) => {
    if (confirm("정말 이 회사의 가입 신청을 거절하시겠습니까?")) {
      try {
        const response = await fetch(`/api/companies/${companyId}/reject`, {
          method: "PATCH",
        });
        
        if (!response.ok) {
          throw new Error("회사 가입 거절에 실패했습니다");
        }
        
        // 목록에서 제거
        setPendingCompanies(prev => prev.filter(company => company.id !== companyId));
        
        alert("회사 가입 신청이 거절되었습니다");
      } catch (err: any) {
        alert(err.message || "회사 가입 거절 중 오류가 발생했습니다");
      }
    }
  };

  const handleUnlock = async (companyId: string) => {
    try {
      const response = await fetch(`/api/companies/${companyId}/unlock`, {
        method: "PATCH",
      });
      
      if (!response.ok) {
        throw new Error("회사 계정 잠금 해제에 실패했습니다");
      }
      
      // 목록 업데이트
      setApprovedCompanies(prev => 
        prev.map(company => 
          company.id === companyId 
            ? {...company, isLocked: false} 
            : company
        )
      );
      
      alert("회사 계정이 잠금 해제되었고 비밀번호가 초기화되었습니다");
    } catch (err: any) {
      alert(err.message || "회사 계정 잠금 해제 중 오류가 발생했습니다");
    }
  };

  const handleDelete = async (companyId: string) => {
    if (confirm("정말 이 회사를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      try {
        const response = await fetch(`/api/companies/${companyId}`, {
          method: "DELETE",
        });
        
        if (!response.ok) {
          throw new Error("회사 삭제에 실패했습니다");
        }
        
        // 목록에서 제거
        setApprovedCompanies(prev => prev.filter(company => company.id !== companyId));
        
        alert("회사가 성공적으로 삭제되었습니다");
      } catch (err: any) {
        alert(err.message || "회사 삭제 중 오류가 발생했습니다");
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const handleLogout = () => {
    // 로그아웃 API 호출
    fetch('/api/auth/logout', {
      method: 'POST'
    }).then(() => {
      router.push('/');
    }).catch(err => {
      console.error('로그아웃 중 오류 발생:', err);
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-4 text-gray-700">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 헤더 */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Image 
              src="/images/Coobie_logo.png" 
              alt="Coobie Logo" 
              width={120} 
              height={40} 
              priority 
            />
            <h1 className="ml-4 text-xl font-bold text-gray-900">루트 관리자 대시보드</h1>
          </div>
          <button 
            onClick={handleLogout}
            className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            로그아웃
          </button>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
            {error}
          </div>
        )}

        {/* 탭 네비게이션 */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("pending")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "pending"
                  ? "border-amber-500 text-amber-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              가입 신청 리스트
              {pendingCompanies.length > 0 && (
                <span className="ml-2 bg-amber-100 text-amber-800 py-0.5 px-2 rounded-full text-xs">
                  {pendingCompanies.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("approved")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "approved"
                  ? "border-amber-500 text-amber-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              회사 관리
            </button>
          </nav>
        </div>

        {/* 가입 신청 리스트 */}
        {activeTab === "pending" && (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg font-medium leading-6 text-gray-900">가입 신청 리스트</h2>
              <p className="mt-1 text-sm text-gray-500">
                승인 대기 중인 회사 목록입니다
              </p>
            </div>
            {pendingCompanies.length === 0 ? (
              <div className="px-4 py-5 sm:p-6 text-center text-gray-500">
                현재 승인 대기 중인 회사가 없습니다
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {pendingCompanies.map((company) => (
                  <li key={company.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <h3 className="text-lg font-medium text-gray-900">
                          {company.companyName}
                        </h3>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <span>사업자번호: {company.businessNumber}</span>
                          <span className="mx-2">•</span>
                          <span>신청일: {formatDate(company.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprove(company.id)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          승인
                        </button>
                        <button
                          onClick={() => handleReject(company.id)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          거절
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* 회사 관리 */}
        {activeTab === "approved" && (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg font-medium leading-6 text-gray-900">회사 관리</h2>
              <p className="mt-1 text-sm text-gray-500">
                등록된 회사 목록입니다
              </p>
            </div>
            {approvedCompanies.length === 0 ? (
              <div className="px-4 py-5 sm:p-6 text-center text-gray-500">
                현재 등록된 회사가 없습니다
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {approvedCompanies.map((company) => (
                  <li key={company.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          <h3 className="text-lg font-medium text-gray-900">
                            {company.companyName}
                          </h3>
                          <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            company.isLocked
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}>
                            {company.isLocked ? "잠금" : "정상"}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <span>사업자번호: {company.businessNumber}</span>
                          <span className="mx-2">•</span>
                          <span>등록일: {formatDate(company.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {company.isLocked && (
                          <button
                            onClick={() => handleUnlock(company.id)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            잠금해제
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(company.id)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </main>
    </div>
  );
}