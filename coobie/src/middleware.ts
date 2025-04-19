// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";

// 토큰에서 사용자 정보 추출
function getTokenData(token: string) {
  try {
    const jwtSecret = process.env.JWT_SECRET || "default-jwt-secret";
    return verify(token, jwtSecret) as {
      userId: string;
      username: string;
      roleId: string;
    };
  } catch (error) {
    return null;
  }
}

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
  const { pathname } = request.nextUrl;

  // 토큰 확인
  const token = request.cookies.get("auth_token")?.value;
  const userData = token ? getTokenData(token) : null;
  const isAuthenticated = !!userData;

  // 로그인 필요한 경로에 대한 처리
  if (isAuthRequired(pathname)) {
    if (!isAuthenticated) {
      // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
      const url = new URL("/", request.url);
      return NextResponse.redirect(url);
    }

    // 역할에 맞지 않는 경로 접근 시 적절한 경로로 리다이렉트
    if (pathname.startsWith("/root") && userData?.roleId !== "00") {
      const url = new URL(getRedirectPathByRole(userData?.roleId), request.url);
      return NextResponse.redirect(url);
    }

    if (pathname.startsWith("/admin") && userData?.roleId !== "01") {
      const url = new URL(getRedirectPathByRole(userData?.roleId), request.url);
      return NextResponse.redirect(url);
    }

    if (pathname.startsWith("/user") && userData?.roleId !== "02") {
      const url = new URL(getRedirectPathByRole(userData?.roleId), request.url);
      return NextResponse.redirect(url);
    }
  }

  // 로그인 상태에서 로그인/가입 페이지 접근 시 자신의 대시보드로 리다이렉트
  if (isAuthenticated && isAuthNotAllowed(pathname)) {
    const url = new URL(getRedirectPathByRole(userData.roleId), request.url);
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
  ],
};
