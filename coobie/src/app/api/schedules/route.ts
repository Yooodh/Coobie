import { NextRequest, NextResponse } from "next/server";
import { SbScheduleRepository } from "@/infra/repositories/supabase/SbScheduleRepository";
import { fetchSchedulesUseCase } from "@/application/usecases/schedule/FetchSchedulesUseCase";
import { createScheduleUseCase } from "@/application/usecases/schedule/CreateScheduleUseCase";
import { updateScheduleUseCase } from "@/application/usecases/schedule/UpdateScheduleUseCase";
import { Schedule } from "@/domain/entities/Schedule";
import { getTokenData } from "@/utils/auth";

// GET: 전체 스케줄 조회
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  try {
    // 1. 쿠키에서 토큰 추출
    const token = request.cookies.get("auth_token")?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 2. 토큰 검증 (사용자 인증만 확인)
    const payload = await getTokenData(token);
    if (!payload?.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // 3. 타겟 사용자 ID 추출 (쿼리 파라미터)
    const targetUserId = searchParams.get("userId");
    if (!targetUserId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // 4. 데이터 조회 (권한 검증 없이 조회 허용)
    const repository = new SbScheduleRepository();
    const schedules = await fetchSchedulesUseCase(repository, targetUserId);

    return NextResponse.json({ blocks: schedules }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "스케줄 조회 실패" }, { status: 500 });
  }
}

// POST: 다중 스케줄 upsert (id 있으면 update, 없으면 insert)
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

    const validSchedules = schedules.map((dto) => ({
      ...dto,
      scheduleCategoryId:
        dto.scheduleCategoryId !== undefined && dto.scheduleCategoryId !== null
          ? dto.scheduleCategoryId
          : 1,
    }));

    const results = [];
    for (const dto of validSchedules) {
      // id가 있으면 update, 없으면 insert
      if (dto.id && dto.id < 1_000_000_000_000) {
        const scheduleToUpdate = new Schedule(
          dto.id,
          dto.userId,
          new Date(dto.startedAt),
          new Date(dto.endedAt),
          new Date(dto.date),
          null,
          dto.scheduleCategoryId
        );
        const result = await updateScheduleUseCase(
          repository,
          scheduleToUpdate
        );
        results.push(result);
      } else {
        const result = await createScheduleUseCase(repository, {
          userId: dto.userId,
          startedAt: new Date(dto.startedAt),
          endedAt: new Date(dto.endedAt),
          date: new Date(dto.date),
          scheduleCategoryId: dto.scheduleCategoryId,
        });
        results.push(result);
      }
    }

    return NextResponse.json({ data: results }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "알 수 없는 오류" },
      { status: 400 }
    );
  }
}
