// src/app/api/users/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import { SbUserRepository } from "@/infra/repositories/supabase/SbUserRepository";

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

// PATCH: Update user status
export async function PATCH(request: NextRequest) {
  try {
    // 쿠키에서 토큰 가져오기
    const token = (await cookies()).get("auth_token")?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: "인증되지 않은 요청입니다" },
        { status: 401 }
      );
    }

    // 토큰 검증
    const tokenData = getTokenData(token);
    if (!tokenData) {
      return NextResponse.json(
        { error: "유효하지 않은 토큰입니다" },
        { status: 401 }
      );
    }

    // 요청 본문에서 상태 정보 추출
    const { status } = await request.json();

    // 상태값 검증
    if (!status || !['online', 'offline', 'busy', 'away'].includes(status)) {
      return NextResponse.json(
        { error: "유효하지 않은 상태값입니다" },
        { status: 400 }
      );
    }

    // 사용자 저장소 초기화
    const userRepository = new SbUserRepository();
    
    // 사용자 상태 업데이트
    await userRepository.updateStatus(tokenData.userId, status);
    
    return NextResponse.json({
      message: "사용자 상태가 성공적으로 업데이트되었습니다",
      status
    });
  } catch (error: any) {
    console.error("사용자 상태 업데이트 중 오류 발생:", error);
    return NextResponse.json(
      { error: "사용자 상태 업데이트 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}