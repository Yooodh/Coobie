// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { SbCompanyRepository } from "@/infra/repositories/supabase/SbCompanyRepository";
import { SbUserRepository } from "@/infra/repositories/supabase/SbUserRepository";
import { RegisterCompanyUseCase } from "@/application/usecases/auth/RegisterCompanyUseCase";

export async function POST(request: NextRequest) {
  try {
    const { companyName, businessNumber, username, nickname, password } = await request.json();

    // 필수 필드 검증
    if (!companyName || !businessNumber || !username || !nickname || !password) {
      return NextResponse.json(
        { error: "모든 필수 항목을 입력해주세요" },
        { status: 400 }
      );
    }

    // 사업자번호 형식 검증 (예: 123-45-67890)
    const businessNumberRegex = /^\d{3}-\d{2}-\d{5}$/;
    if (!businessNumberRegex.test(businessNumber)) {
      return NextResponse.json(
        { error: "사업자번호 형식이 올바르지 않습니다 (예: 123-45-67890)" },
        { status: 400 }
      );
    }

    // 저장소 및 유스케이스 초기화
    const companyRepository = new SbCompanyRepository();
    const userRepository = new SbUserRepository();
    const registerCompanyUseCase = new RegisterCompanyUseCase(
      companyRepository,
      userRepository
    );

    // 회사 및 관리자 사용자 등록
    const result = await registerCompanyUseCase.execute(
      companyName,
      businessNumber,
      username,
      nickname,
      password
    );

    return NextResponse.json({
      message: "회사 가입 신청이 접수되었습니다. 관리자 승인 후 이용 가능합니다.",
      company: {
        id: result.company.id,
        companyName: result.company.companyName,
        businessNumber: result.company.businessNumber,
      },
      adminUser: {
        id: result.adminUser.id,
        username: result.adminUser.username,
        nickname: result.adminUser.nickname,
      }
    }, { status: 201 });
  } catch (error: any) {
    console.error("회사 가입 신청 중 오류 발생:", error);

    // 특정 오류 처리
    if (error.message === "이미 등록된 사업자번호입니다") {
      return NextResponse.json(
        { error: "이미 등록된 사업자번호입니다" },
        { status: 409 }
      );
    } else if (error.message === "이미 사용 중인 사용자명입니다") {
      return NextResponse.json(
        { error: "이미 사용 중인 사용자명입니다" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "회사 가입 신청 처리 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}