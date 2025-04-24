// /src/app/api/companies/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { SbCompanyRepository } from "@/infra/repositories/supabase/SbCompanyRepository";
import { DeleteCompanyUseCase } from "@/application/usecases/company/DeleteCompanyUseCase";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const companyId = params.id;

    // 저장소 및 유스케이스 초기화
    const companyRepository = new SbCompanyRepository();
    const deleteCompanyUseCase = new DeleteCompanyUseCase(companyRepository);

    // 회사 삭제 처리
    await deleteCompanyUseCase.execute(companyId);

    return NextResponse.json({
      message: `ID가 ${companyId}인 회사가 성공적으로 삭제되었습니다`,
    });
  } catch (error: any) {
    console.error(`회사 삭제 중 오류 발생 (ID: ${params.id}):`, error);
    return NextResponse.json(
      { error: error.message || "회사 삭제에 실패했습니다" },
      { status: 500 }
    );
  }
}