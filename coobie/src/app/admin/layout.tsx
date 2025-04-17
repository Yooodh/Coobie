"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PropsWithChildren } from "react";

export default function AdminLayout({ children }: PropsWithChildren) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen">
      {/* 사이드바 */}
      <div className="w-64 bg-amber-300 flex flex-col">
        {/* 로고 */}
        <div className="p-6">
          <h1 className="text-4xl font-bold text-gray-800">COOBIE</h1>
        </div>

        {/* 메뉴 링크 */}
        <nav className="flex-1 flex flex-col">
          <Link
            href="/admin/users"
            className={`py-3 px-6 border-t border-b border-amber-400 ${
              pathname === "/admin/users" ? "font-bold" : ""
            }`}
          >
            사원 관리
          </Link>
          <Link
            href="/admin/users/create"
            className={`py-3 px-6 border-b border-amber-400 ${
              pathname === "/admin/users/create" ? "font-bold" : ""
            }`}
          >
            사원 등록
          </Link>
          <Link
            href="/admin/settings"
            className={`py-3 px-6 border-b border-amber-400 ${
              pathname === "/admin/settings" ? "font-bold" : ""
            }`}
          >
            설정
          </Link>
        </nav>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 overflow-y-auto bg-gray-50">{children}</div>
    </div>
  );
}
