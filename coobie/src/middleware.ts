// // src/middleware.ts
// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
// import { getTokenData } from "./utils/auth";

// // 로그인 필요한 경로 확인
// function isAuthRequired(pathname: string) {
//   return (
//     pathname.startsWith("/root") ||
//     pathname.startsWith("/admin") ||
//     pathname.startsWith("/user") ||
//     pathname === "/dashboard"
//   );
// }

// // 로그인 상태에서 접근 불가능한 경로 확인
// function isAuthNotAllowed(pathname: string) {
//   return pathname === "/" || pathname.startsWith("/auth");
// }

// // 역할에 따른 리다이렉트 경로 결정
// function getRedirectPathByRole(roleId: string) {
//   switch (roleId) {
//     case "00": // 루트 관리자
//       return "/root/dashboard";
//     case "01": // 회사 관리자
//       return "/admin/users";
//     case "02": // 일반 사용자
//       return "/user/dashboard";
//     default:
//       return "/";
//   }
// }

// export async function middleware(request: NextRequest) {
//   const token = request.cookies.get("auth_token")?.value;

//   if (request.nextUrl.pathname === "/api/auth/logout") {
//     return NextResponse.next();
//   }

//   const userData = token ? await getTokenData(token) : null;
//   const isAuthenticated = !!userData;

//   if (!isAuthenticated) {
//     console.log("User not authenticated. Redirecting to login page.");
//     const url = new URL("/", request.url);
//     return NextResponse.redirect(url);
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     "/",
//     "/auth/:path*",
//     "/root/:path*",
//     "/admin/:path*",
//     "/user/:path*",
//     "/dashboard",
//   ],
// };

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
  
  const userData = token ? await getTokenData(token) : null;
  const isAuthenticated = !!userData;
  
  // 인증이 필요한 페이지에 접근하려고 하는데 로그인이 안 된 경우
  if (isAuthRequired(request.nextUrl.pathname) && !isAuthenticated) {
    const url = new URL("/", request.url);
    return NextResponse.redirect(url);
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