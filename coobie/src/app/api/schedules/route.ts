import { NextRequest, NextResponse } from "next/server";
import { SbScheduleRepository } from "@/infra/repositories/supabase/SbScheduleRepository";
import { fetchSchedulesUseCase } from "@/application/usecases/schedule/FetchSchedulesUseCase";
import { createScheduleUseCase } from "@/application/usecases/schedule/CreateScheduleUseCase";

// GET: 전체 스케줄 조회
export async function GET() {
  try {
    const repository = new SbScheduleRepository();
    const schedules = await fetchSchedulesUseCase(repository);
    return NextResponse.json({ data: schedules }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "스케줄 데이터를 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

// POST: 스케줄 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const repository = new SbScheduleRepository();

    const { userId, startedAt, date, scheduleCategoryId, endedAt } = body;

    const result = await createScheduleUseCase(repository, {
      userId,
      startedAt: new Date(startedAt),
      date: new Date(date),
      endedAt: endedAt ? new Date(endedAt) : new Date(),
      scheduleCategoryId,
    });

    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "알 수 없는 오류" },
      { status: 400 }
    );
  }
}
