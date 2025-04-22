"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { PropsWithChildren } from "react";

export default function AdminLayout({ children }: PropsWithChildren) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen">
      {/* 사이드바 */}
      <div className="w-64 bg-amber-300 flex flex-col">
        {/* 로고 */}
        <div className="p-10 flex">
          <Link href="/">
            <Image
              src="/images/Coobie_logo.png"
              alt="Coobie Logo"
              width={150}
              height={60}
              priority
            />
          </Link>
        </div>

        {/* 메뉴 링크 */}
        <nav className="flex-1 flex flex-col">
          <Link
            href="/admin/users"
            className={`py-3 px-6 border-t border-b border-amber-400 ${
              pathname === "/admin/users" ? "font-bold text-white" : ""
            }`}
          >
            사원 관리
          </Link>
          <Link
            href="/admin/users/create"
            className={`py-3 px-6 border-b border-amber-400 ${
              pathname === "/admin/users/create" ? "font-bold text-white" : ""
            }`}
          >
            사원 등록
          </Link>
          <Link
            href="/admin/settings"
            className={`py-3 px-6 border-b border-amber-400 ${
              pathname === "/admin/settings" ? "font-bold text-white" : ""
            }`}
          >
            설정
          </Link>
        </nav>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 overflow-y-auto bg-black-500">{children}</div>
    </div>
  );
}
