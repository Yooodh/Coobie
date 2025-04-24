import { NextRequest, NextResponse } from "next/server";
import { SbScheduleRepository } from "@/infra/repositories/supabase/SbScheduleRepository";
import { MoveScheduleToCategoryUseCase } from "@/application/usecases/schedule/MoveScheduleToCategoryUseCase";

// PATCH: 스케줄 카테고리 이동
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { scheduleId, newCategoryId } = body;

    // 필수 필드 & 타입 검증
    if (typeof scheduleId !== "number" || typeof newCategoryId !== "number") {
      return NextResponse.json(
        { error: "유효하지 않은 ID 형식입니다." },
        { status: 400 }
      );
    }

    const repository = new SbScheduleRepository();
    const updatedSchedule = await MoveScheduleToCategoryUseCase(repository, {
      scheduleId,
      newCategoryId,
    });

    return NextResponse.json({ data: updatedSchedule }, { status: 200 });
  } catch (error) {
    console.error("스케줄 이동 에러:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "알 수 없는 오류" },
      { status: 500 }
    );
  }
}
