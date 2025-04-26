import { NextRequest, NextResponse } from "next/server";
import { SbScheduleRepository } from "@/infra/repositories/supabase/SbScheduleRepository";
import { fetchSchedulesUseCase } from "@/application/usecases/schedule/FetchSchedulesUseCase";
import { createScheduleUseCase } from "@/application/usecases/schedule/CreateScheduleUseCase";

// GET: 전체 스케줄 조회
export async function GET() {
  try {
    const repository = new SbScheduleRepository();
    const schedules = await fetchSchedulesUseCase(repository);
    return NextResponse.json({ blocks: schedules }, { status: 200 });
  } catch (error) {
    console.error("스케줄 조회 실패:", error);
    return NextResponse.json(
      { error: "스케줄 데이터 불러오기 실패" },
      { status: 500 }
    );
  }
}

// POST: 다중 스케줄 생성
export async function POST(request: NextRequest) {
  try {
    const { schedules } = await request.json();
    if (!Array.isArray(schedules)) {
      return NextResponse.json(
        { error: "schedules 배열이 필요합니다" },
        { status: 400 }
      );
    }

    const repository = new SbScheduleRepository();

    // 유효성 검증 추가
    const validSchedules = schedules.map((dto) => ({
      ...dto,
      // scheduleCategoryId가 없거나 null이면 기본값 1 사용
      scheduleCategoryId: dto.scheduleCategoryId || 1,
    }));

    // 배열 처리 (병렬 처리)
    const results = await Promise.all(
      validSchedules.map(async (dto) => {
        return createScheduleUseCase(repository, {
          userId: dto.userId,
          startedAt: new Date(dto.startedAt),
          endedAt: new Date(dto.endedAt),
          date: new Date(dto.date),
          scheduleCategoryId: dto.scheduleCategoryId,
        });
      })
    );
    return NextResponse.json({ data: results }, { status: 201 });
  } catch (error) {
    console.error("스케줄 생성 실패:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "알 수 없는 오류" },
      { status: 400 }
    );
  }
}
