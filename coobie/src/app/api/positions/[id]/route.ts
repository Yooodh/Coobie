// src/app/api/positions/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { SbPositionRepository } from "@/infra/repositories/supabase/SbPositionRepository";
import { DeletePositionUseCase } from "@/application/usecases/admin/DeletePositionUseCase";

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

// DELETE 메서드 - 직급 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const positionId = parseInt(params.id);
    
    if (isNaN(positionId) || positionId <= 0) {
      return NextResponse.json(
        { error: "유효하지 않은 직급 ID입니다" },
        { status: 400 }
      );
    }
    
    // 저장소 및 유스케이스 초기화
    const positionRepository = new SbPositionRepository();
    const deletePositionUseCase = new DeletePositionUseCase(positionRepository);

    // 직급 삭제 실행
    await deletePositionUseCase.execute(positionId);
    
    return NextResponse.json({
      message: `ID가 ${positionId}인 직급이 성공적으로 삭제되었습니다`
    });
  } catch (error: unknown) {
    console.error(`직급 삭제 중 오류 발생 (ID: ${params.id}):`, error);
    
    const errorMessage = getErrorMessage(error);
    
    // 특정 오류 메시지에 따른 적절한 HTTP 상태 코드 반환
    if (errorMessage.includes("사용자가 이 직급을 사용하고 있어 삭제할 수 없습니다")) {
      return NextResponse.json(
        { error: errorMessage },
        { status: 409 } // Conflict
      );
    }
    
    if (errorMessage.includes("찾을 수 없습니다")) {
      return NextResponse.json(
        { error: errorMessage },
        { status: 404 } // Not Found
      );
    }
    
    return NextResponse.json(
      { error: errorMessage || "직급 삭제에 실패했습니다" },
      { status: 500 }
    );
  }