import { NextRequest, NextResponse } from "next/server";
import { SbScheduleRepository } from "@/infra/repositories/supabase/SbScheduleRepository";
import { fetchScheduleCategoriesUseCase } from "@/application/usecases/schedule/FetchScheduleCategoriesUseCase";

// GET : 카테고리 조회
export async function GET(request: NextRequest) {
  try {
    const repository = new SbScheduleRepository();
    const categories = await fetchScheduleCategoriesUseCase(repository);
    return NextResponse.json({ data: categories }, { status: 200 });
  } catch (error) {
    console.error("카테고리 조회 에러:", error);
    return NextResponse.json(
      { error: "카테고리 데이터를 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}
