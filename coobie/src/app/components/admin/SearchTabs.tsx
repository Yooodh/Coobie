"use client";

import { useState } from "react";

interface SearchTabsProps {
  onSearch: (searchTerm: string, searchType: string) => void;
}

export default function SearchTabs({ onSearch }: SearchTabsProps) {
  const [activeTab, setActiveTab] = useState("검색옵션");
  const [searchTerm, setSearchTerm] = useState("");

  const tabs = ["검색옵션", "전체", "이름", "아이디", "직급", "소속부서", "임시일자", "퇴사자"];

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    
    // 탭을 클릭했을 때 자동으로 검색이 필요하면 아래 주석을 해제
    // if (tab !== "검색옵션") {
    //   onSearch(searchTerm, tab);
    // }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm, activeTab);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 whitespace-nowrap ${
              activeTab === tab
                ? "font-bold border-b-2 border-amber-400"
                : "text-gray-500"
            }`}
            onClick={() => handleTabClick(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 검색 입력 */}
      <div className="mt-4">
        <form onSubmit={handleSubmit} className="flex items-center">
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
  );
}