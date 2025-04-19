// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getTokenData } from "./utils/auth";

// 로그인 필요한 경로 확인
function isAuthRequired(pathname: string) {
  return (
    pathname.startsWith("/root") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/user") ||
    pathname === "/dashboard"
  );
}

// 로그인 상태에서 접근 불가능한 경로 확인
function isAuthNotAllowed(pathname: string) {
  return pathname === "/" || pathname.startsWith("/auth");
}

// 역할에 따른 리다이렉트 경로 결정
function getRedirectPathByRole(roleId: string) {
  switch (roleId) {
    case "00": // 루트 관리자
      return "/root/dashboard";
    case "01": // 회사 관리자
      return "/admin/users";
    case "02": // 일반 사용자
      return "/user/dashboard";
    default:
      return "/";
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  console.log("Auth Token: ", token);

  const userData = token ? await getTokenData(token) : null;
  console.log("Decoded User Data:", userData);

  const isAuthenticated = !!userData;
  console.log("Is Authenticated: ", isAuthenticated);

  if (!isAuthenticated) {
    console.log("User not authenticated. Redirecting to login page.");
    const url = new URL("/", request.url);
    return NextResponse.redirect(url);
  }

  console.log("Request passed through middleware without redirection.");
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/auth/:path*",
    "/root/:path*",
    "/admin/:path*",
    "/user/:path*",
    "/dashboard",
  ],
};
