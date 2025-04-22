// src/middleware.ts (수정)
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

function canAccessPath(roleId: string, pathname: string) {
  if (pathname.startsWith("/root") && roleId !== "00") {
    return false; // 루트 경로는 루트 관리자만 접근 가능
  }
  if (pathname.startsWith("/admin") && roleId !== "01") {
    return false; // 관리자 경로는 회사 관리자만 접근 가능
  }
  if (pathname.startsWith("/user") && roleId !== "02") {
    return false; // 사용자 경로는 일반 사용자만 접근 가능
  }
  return true;
}

// 로그인 상태에서 접근 불가능한 경로 확인
function isAuthNotAllowed(pathname: string) {
  return pathname === "/" || pathname.startsWith("/auth");
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;

  // 로그아웃 페이지는 항상 허용
  if (request.nextUrl.pathname === "/api/auth/logout") {
    return NextResponse.next();
  }
  // 루트 로그인 페이지는 항상 허용
  if (request.nextUrl.pathname === "/root/login") {
    return NextResponse.next();
  }

  const userData = token ? await getTokenData(token) : null;
  const isAuthenticated = !!userData;

  // 인증이 필요한 페이지에 접근하려고 하는데 로그인이 안 된 경우
  if (isAuthRequired(request.nextUrl.pathname) && !isAuthenticated) {
    // 루트 경로인 경우 루트 로그인 페이지로 리다이렉트
    if (request.nextUrl.pathname.startsWith("/root")) {
      const url = new URL("/root/login", request.url);
      return NextResponse.redirect(url);
    }

    const url = new URL("/", request.url);
    return NextResponse.redirect(url);
  }

  // 인증된 사용자가 자신의 역할에 맞지 않는 경로에 접근하려는 경우
  // 인증된 사용자가 자신의 역할에 맞지 않는 경로에 접근하려는 경우
  if (isAuthenticated && userData && typeof userData.roleId === "string") {
    const roleIdStr = userData.roleId as string;

    if (!canAccessPath(roleIdStr, request.nextUrl.pathname)) {
      // 각 역할에 맞는 홈 페이지로 리다이렉트
      let redirectUrl = "/user/dashboard"; // 기본값

      if (roleIdStr === "00") {
        redirectUrl = "/root/dashboard";
      } else if (roleIdStr === "01") {
        redirectUrl = "/admin/users";
      }

      const url = new URL(redirectUrl, request.url);
      return NextResponse.redirect(url);
    }
  }
  // 로그인된 상태에서 로그인 페이지와 같은 인증 불필요 페이지에 접근하려고 할 때
  if (isAuthNotAllowed(request.nextUrl.pathname) && isAuthenticated) {
    // 역할에 따라 리다이렉트
    const roleId = userData?.roleId || "02";
    let redirectUrl = "/user/dashboard"; // 기본값

    if (roleId === "00") {
      redirectUrl = "/root/dashboard";
    } else if (roleId === "01") {
      redirectUrl = "/admin/users";
    }

    const url = new URL(redirectUrl, request.url);
    return NextResponse.redirect(url);
  }

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
    "/api/auth/logout",
  ],
};
