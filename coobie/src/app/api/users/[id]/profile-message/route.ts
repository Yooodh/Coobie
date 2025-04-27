// src/app/api/users/[id]/profile-message/route.ts
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

// PATCH: Update user profile message
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    
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

    // 자신의 프로필 메시지만 수정 가능
    if (tokenData.userId !== userId) {
      return NextResponse.json(
        { error: "다른 사용자의 프로필 메시지를 수정할 권한이 없습니다" },
        { status: 403 }
      );
    }

    // 요청 본문에서 프로필 메시지 추출
    const { profileMessage } = await request.json();

    // 프로필 메시지 검증 (100자 제한)
    if (profileMessage && profileMessage.length > 100) {
      return NextResponse.json(
        { error: "프로필 메시지는 100자를 초과할 수 없습니다" },
        { status: 400 }
      );
    }

    // 사용자 저장소 초기화
    const userRepository = new SbUserRepository();
    
    // 사용자 정보 조회
    const user = await userRepository.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다" },
        { status: 404 }
      );
    }
    
    // 사용자 프로필 메시지 업데이트
    const updatedUser = await userRepository.update({
      ...user,
      profileMessage: profileMessage || ""
    });
    
    return NextResponse.json({
      message: "프로필 메시지가 성공적으로 업데이트되었습니다",
      profileMessage: updatedUser.profileMessage
    });
  } catch (error: any) {
    console.error("프로필 메시지 업데이트 중 오류 발생:", error);
    return NextResponse.json(
      { error: "프로필 메시지 업데이트 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}