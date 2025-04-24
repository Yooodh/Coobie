import { NextRequest, NextResponse } from "next/server";
import { SbUserRepository } from "@/infra/repositories/supabase/SbUserRepository";
import { UpdateUserUseCase } from "@/application/usecases/user/UpdateUserUseCase";

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    const { isLocked } = await request.json();
    
    if (isLocked === undefined) {
      return NextResponse.json(
        { error: "잠금 상태 값(isLocked)은 필수 입력 항목입니다" },
        { status: 400 }
      );
    }
    
    // 저장소 및 유스케이스 초기화
    const userRepository = new SbUserRepository();
    const updateUserUseCase = new UpdateUserUseCase(userRepository);

    // 잠금 상태 업데이트
    await updateUserUseCase.updateLockStatus(userId, isLocked);
    
    return NextResponse.json({
      message: `ID가 ${userId}인 사용자의 잠금 상태가 성공적으로 ${isLocked ? '잠금' : '해제'}되었습니다`
    });
  } catch (error: unknown) {
    console.error(`잠금 상태 변경 중 오류 발생 (ID: ${params.id}):`, error);
    return NextResponse.json(
      { error: getErrorMessage(error) || "잠금 상태 변경에 실패했습니다" },
      { status: 500 }
    );
  }
}