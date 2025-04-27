// src/app/api/auth/update-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { SbUserRepository } from "@/infra/repositories/supabase/SbUserRepository";
import { UpdatePasswordUseCase } from "@/application/usecases/user/UpdatePasswordUseCase";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";

// 오류 타입 정의
interface ErrorWithMessage {
  message: string;
}

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
  if (isErrorWithMessage(maybeError)) return maybeError;
  
  try {
    return new Error(JSON.stringify(maybeError));
  } catch {
    // 직렬화할 수 없는 경우 기본 오류 메시지 사용
    return new Error(String(maybeError));
  }
}

function getErrorMessage(error: unknown): string {
  return toErrorWithMessage(error).message;
}

// 토큰에서 사용자 정보 추출
function getTokenData(token: string) {
  try {
    const jwtSecret = process.env.JWT_SECRET || "default-jwt-secret";
    return verify(token, jwtSecret) as {
      userId: string;
      username: string;
      roleId: string;
      businessNumber?: string;
    };
  } catch (error) {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // 인증 토큰 확인
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

    // 요청 본문에서 비밀번호 정보 추출
    const { currentPassword, newPassword, confirmPassword } = await request.json();

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: "모든 필드를 입력해주세요" },
        { status: 400 }
      );
    }

    // 새 비밀번호 확인
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "새 비밀번호가 일치하지 않습니다" },
        { status: 400 }
      );
    }

    // 비밀번호 복잡성 검증 (옵션)
    if (newPassword.length < 4) {
      return NextResponse.json(
        { error: "비밀번호는 최소 4자 이상이어야 합니다" },
        { status: 400 }
      );
    }

    // 유스케이스 초기화
    const userRepository = new SbUserRepository();
    const updatePasswordUseCase = new UpdatePasswordUseCase(userRepository);

    // 비밀번호 변경 실행
    await updatePasswordUseCase.execute(
      tokenData.userId,
      currentPassword,
      newPassword
    );

    return NextResponse.json({
      success: true,
      message: "비밀번호가 성공적으로 변경되었습니다",
    });

  } catch (error: unknown) {
    console.error("비밀번호 변경 중 오류 발생:", error);
    
    const errorMessage = getErrorMessage(error);
    
    // 특정 오류 메시지에 따른 적절한 HTTP 상태 코드 반환
    if (errorMessage.includes("현재 비밀번호가 일치하지 않습니다")) {
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: errorMessage || "비밀번호 변경에 실패했습니다" },
      { status: 500 }
    );
  }
}