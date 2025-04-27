import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SbUserRepository } from "@/infra/repositories/supabase/SbUserRepository";
import { verify } from "jsonwebtoken";

// 토큰에서 사용자 정보 추출 함수 추가
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

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    
    // 토큰 가져와서 사용자 ID 추출
    const token = cookieStore.get("auth_token")?.value;
    
    if (token) {
      // 토큰에서 사용자 정보 추출
      const tokenData = getTokenData(token);
      
      // 토큰이 유효하고 사용자 ID가 있으면 상태 업데이트
      if (tokenData && tokenData.userId) {
        // 사용자 상태를 offline으로 업데이트
        const userRepository = new SbUserRepository();
        await userRepository.updateStatus(tokenData.userId, "offline");
      }
    }
    
    // 토큰 쿠키 삭제
    cookieStore.delete("auth_token");

    return NextResponse.json({
      success: true,
      message: "로그아웃 되었습니다.",
    });
  } catch (error: unknown) {
    console.error("로그아웃 처리 중 오류 발생:", error);
    return NextResponse.json(
      { success: false, error: "로그아웃 처리 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}