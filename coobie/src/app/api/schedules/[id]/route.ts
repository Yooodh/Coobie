import { NextRequest, NextResponse } from "next/server";
import { SbScheduleRepository } from "@/infra/repositories/supabase/SbScheduleRepository";
import { deleteScheduleUseCase } from "@/application/usecases/schedule/DeleteScheduleUseCase";

// DELETE : 카테고리 삭제
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } } // context로 받기
) {
  // params를 await로 비동기 접근
  const params = await context.params;
  const scheduleId = Number(params.id);

  // 쿼리 파라미터에서 userId 추출
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!scheduleId || !userId) {
    return NextResponse.json(
      { error: "userId와 scheduleId가 필요합니다." },
      { status: 400 }
    );
  }
  try {
    const repository = new SbScheduleRepository();
    const result = await deleteScheduleUseCase(repository, {
      userId,
      scheduleId,
    });
    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "알 수 없는 오류" },
      { status: 500 }
    );
  }
}
