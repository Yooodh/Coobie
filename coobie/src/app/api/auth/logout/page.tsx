// src/app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    // auth_token 쿠키 삭제
    (await
      // auth_token 쿠키 삭제
      cookies()).delete("auth_token");
    
    return NextResponse.json({
      message: "로그아웃 되었습니다",
    });
  } catch (error: any) {
    console.error("로그아웃 중 오류 발생:", error);
    return NextResponse.json(
      { error: "로그아웃 처리 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}