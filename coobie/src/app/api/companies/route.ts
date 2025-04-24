// /src/app/api/companies/route.ts
import { NextRequest, NextResponse } from "next/server";
import { SbCompanyRepository } from "@/infra/repositories/supabase/SbCompanyRepository";
import { GetCompanyUseCase } from "@/application/usecases/company/GetCompanyUseCase";
import { CompanyFilter } from "@/domain/repositories/filters/CompanyFilter";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // 필터 매개변수 추출
    const companyName = searchParams.get("companyName") || undefined;
    const businessNumber = searchParams.get("businessNumber") || undefined;
    const isLocked = searchParams.has("isLocked")
      ? searchParams.get("isLocked") === "true"
      : undefined;
    const isApproved = searchParams.has("isApproved")
      ? searchParams.get("isApproved") === "true"
      : undefined;

    // 페이지네이션
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // 필터 객체 생성
    const filter = new CompanyFilter(
      companyName,
      businessNumber,
      isLocked,
      isApproved,
      offset,
      limit
    );

    // 저장소 및 유스케이스 초기화
    const companyRepository = new SbCompanyRepository();
    const getCompanyUseCase = new GetCompanyUseCase(companyRepository);

    // 회사 목록 조회
    const result = await getCompanyUseCase.getAll(filter);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("회사 목록 조회 중 오류 발생:", error);
    return NextResponse.json(
      {
        error: error.message || "회사 목록을 불러오는데 실패했습니다",
      },
      { status: 500 }
    );
  }
}