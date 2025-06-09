// src/app/api/companies/[id]/approve/route.ts
import { NextRequest, NextResponse } from "next/server";
import { SbCompanyRepository } from "@/infra/repositories/supabase/SbCompanyRepository";
import { ApproveCompanyUseCase } from "@/application/usecases/company/ApproveCompanyUseCase";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 동적 라우트 파라미터 처리
    const companyId = params?.id;
    
    if (!companyId) {
      return NextResponse.json(
        { error: "회사 ID가 제공되지 않았습니다" },
        { status: 400 }
      );
    }

    // 저장소 및 유스케이스 초기화
    const companyRepository = new SbCompanyRepository();
    const approveCompanyUseCase = new ApproveCompanyUseCase(companyRepository);

    // 회사 승인 처리
    await approveCompanyUseCase.execute(companyId);

    return NextResponse.json({
      message: `ID가 ${companyId}인 회사가 성공적으로 승인되었습니다`,
    });
  } catch (error: any) {
    console.error(`회사 승인 중 오류 발생:`, error);
    return NextResponse.json(
      { error: error.message || "회사 승인에 실패했습니다" },
      { status: 500 }
    );
  }
}