"use client";

import { useState } from "react";

interface SearchTabsProps {
  onSearch: (searchTerm: string, searchType: string) => void;
}

export default function SearchTabs({ onSearch }: SearchTabsProps) {
  const [activeTab, setActiveTab] = useState("검색옵션");
  const [searchTerm, setSearchTerm] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm, activeTab);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
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
