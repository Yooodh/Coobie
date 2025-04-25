// src/app/api/companies/[id]/reset-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { SbCompanyRepository } from "@/infra/repositories/supabase/SbCompanyRepository";
import { ResetCompanyPasswordUseCase } from "@/application/usecases/company/ResetCompanyPasswordUseCase";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // params 객체 비동기 처리를 위한 변수
  const id = params?.id;

  if (!id) {
    return NextResponse.json(
      { error: "회사 ID가 제공되지 않았습니다" },
      { status: 400 }
    );
  }

  try {
    const { defaultPassword = "0000" } = await request.json();

    // 저장소 및 유스케이스 초기화
    const companyRepository = new SbCompanyRepository();
    const resetCompanyPasswordUseCase = new ResetCompanyPasswordUseCase(
      companyRepository
    );

    // 비밀번호 초기화 및 계정 잠금 해제 (두 기능을 함께 처리)
    await resetCompanyPasswordUseCase.execute(id, defaultPassword);

    return NextResponse.json({
      message: `ID가 ${id}인 회사의 관리자 비밀번호가 초기화되고 계정 잠금이 해제되었습니다`,
    });
  } catch (error: any) {
    if (error instanceof Error) {
      console.error(
        `회사 관리자 비밀번호 초기화 중 오류 발생 (ID: ${id}): ${error}`
      );
    }
    return NextResponse.json(
      { error: error.message || "회사 관리자 비밀번호 초기화에 실패했습니다" },
      { status: 500 }
    );
  }
}
