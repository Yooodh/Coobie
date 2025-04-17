import { NextRequest, NextResponse } from "next/server";
import { FetchSchedulesUseCase } from "@/application/usecases/schedule/FetchSchedulesUseCase";
import { SbScheduleRepository } from "@/infra/repositories/supabase/SbScheduleRepository";

// GET 메서드 핸들러 정의
export async function GET(request: NextRequest) {
  try {
    // Supabase 기반 스케줄 저장소(repository) 인스턴스 생성
    const repository = new SbScheduleRepository();

    // 스케줄 목록 조회 UseCase 실행 (repository 의존성 주입)
    const schedules = await FetchSchedulesUseCase(repository);

    // 조회된 스케줄 데이터를 JSON 형태로 응답
    return NextResponse.json({ data: schedules });
  } catch (error) {
    // 에러 발생 시 콘솔에 로그 출력
    console.error("스케줄 조회 에러:", error);

    // 에러 메시지를 포함한 JSON 응답 반환 (HTTP 상태코드 500)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? `서버 에러: ${error.message}` // Error 객체일 경우 상세 메시지 제공
            : "스케줄 목록을 불러오지 못했습니다.", // 일반 오류 메시지
      },
      { status: 500 }
    );
  }
}
