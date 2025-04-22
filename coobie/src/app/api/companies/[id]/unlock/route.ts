// /src/app/api/companies/[id]/unlock/route.ts
import { NextRequest, NextResponse } from "next/server";
import { SbCompanyRepository } from "@/infra/repositories/supabase/SbCompanyRepository";
import { UnlockCompanyUseCase } from "@/application/usecases/company/UnlockCompanyUseCase";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const companyId = params.id;

    // 저장소 및 유스케이스 초기화
    const companyRepository = new SbCompanyRepository();
    const unlockCompanyUseCase = new UnlockCompanyUseCase(companyRepository);

    // 회사 잠금 해제 처리
    await unlockCompanyUseCase.execute(companyId);

    return NextResponse.json({
      message: `ID가 ${companyId}인 회사의 계정이 잠금 해제되었습니다`,
    });
  } catch (error: any) {
    console.error(`회사 잠금 해제 중 오류 발생 (ID: ${params.id}):`, error);
    return NextResponse.json(
      { error: error.message || "회사 계정 잠금 해제에 실패했습니다" },
      { status: 500 }
    );
  }
}