// /src/app/api/companies/[id]/reject/route.ts
import { NextRequest, NextResponse } from "next/server";
import { SbCompanyRepository } from "@/infra/repositories/supabase/SbCompanyRepository";
import { RejectCompanyUseCase } from "@/application/usecases/company/RejectCompanyUseCase";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const companyId = params.id;

    // 저장소 및 유스케이스 초기화
    const companyRepository = new SbCompanyRepository();
    const rejectCompanyUseCase = new RejectCompanyUseCase(companyRepository);

    // 회사 거절 처리
    await rejectCompanyUseCase.execute(companyId);

    return NextResponse.json({
      message: `ID가 ${companyId}인 회사의 가입 신청이 거절되었습니다`,
    });
  } catch (error: any) {
    console.error(`회사 거절 중 오류 발생 (ID: ${params.id}):`, error);
    return NextResponse.json(
      { error: error.message || "회사 가입 신청 거절에 실패했습니다" },
      { status: 500 }
    );
  }
}