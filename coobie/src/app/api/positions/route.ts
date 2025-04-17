import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

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

// GET 핸들러 (직급 목록 조회)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // 삭제되지 않은 직급만 가져오기
    const { data, error } = await supabase
      .from("position")
      .select("*")
      .is("deleted_at", null)
      .order("position_name", { ascending: true });
    
    if (error) {
      throw new Error(`직급 데이터 조회 실패: ${error.message}`);
    }
    
    // 응답 데이터 형식 변환
    const positions = data.map(pos => ({
      id: pos.ID,
      positionName: pos.position_name,
      createdAt: pos.created_at
    }));
    
    return NextResponse.json(positions);
  } catch (error: unknown) {
    console.error("직급 목록 조회 중 오류 발생:", error);
    return NextResponse.json(
      { error: getErrorMessage(error) || "직급 목록을 불러오는데 실패했습니다" },
      { status: 500 }
    );
  }
}