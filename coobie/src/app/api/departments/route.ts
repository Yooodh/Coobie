import { NextRequest, NextResponse } from "next/server";
import { SbDepartmentRepository } from "@/infra/repositories/supabase/SbDepartmentRepository";

// 오류 타입 정의
interface ErrorWithMessage {
  message: string;
}

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
  if (isErrorWithMessage(maybeError)) return maybeError;
  
  try {
    return new Error(JSON.stringify(maybeError));
  } catch {
    // 직렬화할 수 없는 경우 기본 오류 메시지 사용
    return new Error(String(maybeError));
  }
}

function getErrorMessage(error: unknown): string {
  return toErrorWithMessage(error).message;
}

// GET 핸들러 (부서 목록 조회)
export async function GET(request: NextRequest) {
  try {
    // 현재 사용자 정보 가져오기
    const currentUserResponse = await fetch(
      `${request.nextUrl.origin}/api/auth/me`,
      {
        headers: request.headers,
      }
    );
    
    if (!currentUserResponse.ok) {
      return NextResponse.json(
        { error: "인증되지 않은 사용자입니다" },
        { status: 401 }
      );
    }
    
    const userData = await currentUserResponse.json();
    const companyId = userData.user.businessNumber;

    if (!companyId) {
      return NextResponse.json(
        { error: "회사 정보를 찾을 수 없습니다" },
        { status: 400 }
      );
    }

    // 부서 저장소 초기화
    const departmentRepository = new SbDepartmentRepository();
    
    // 해당 회사의 부서 가져오기
    const departments = await departmentRepository.getAllByCompany(companyId);
    
    // 응답 데이터 형식 변환
    const formattedDepartments = departments.map(dept => ({
      id: dept.id,
      departmentName: dept.departmentName,
      createdAt: dept.createdAt,
      companyId: dept.company_id
    }));
    
    return NextResponse.json(formattedDepartments);
  } catch (error: unknown) {
    console.error("부서 목록 조회 중 오류 발생:", error);
    return NextResponse.json(
      { error: getErrorMessage(error) || "부서 목록을 불러오는데 실패했습니다" },
      { status: 500 }
    );
  }
}

// POST 핸들러 (부서 생성)
export async function POST(request: NextRequest) {
  try {
    // 현재 사용자 정보 가져오기
    const currentUserResponse = await fetch(
      `${request.nextUrl.origin}/api/auth/me`,
      {
        headers: request.headers,
      }
    );
    
    if (!currentUserResponse.ok) {
      return NextResponse.json(
        { error: "인증되지 않은 사용자입니다" },
        { status: 401 }
      );
    }
    
    const userData = await currentUserResponse.json();
    const companyId = userData.user.businessNumber;

    if (!companyId) {
      return NextResponse.json(
        { error: "회사 정보를 찾을 수 없습니다" },
        { status: 400 }
      );
    }
    
    // 요청 본문 파싱
    const body = await request.json();
    const { departmentName } = body;
    
    if (!departmentName || typeof departmentName !== "string") {
      return NextResponse.json(
        { error: "부서명은 필수 입력 항목입니다" },
        { status: 400 }
      );
    }
    
    // 부서 저장소 초기화
    const departmentRepository = new SbDepartmentRepository();
    
    // 부서 생성
    const newDepartment = await departmentRepository.create(companyId, departmentName);
    
    // 응답 데이터 형식 변환
    const formattedDepartment = {
      id: newDepartment.id,
      departmentName: newDepartment.departmentName,
      createdAt: newDepartment.createdAt,
      companyId: newDepartment.company_id
    };
    
    return NextResponse.json(formattedDepartment, { status: 201 });
  } catch (error: unknown) {
    console.error("부서 생성 중 오류 발생:", error);
    
    const errorMessage = getErrorMessage(error);
    
    // 중복 오류 처리
    if (errorMessage.includes("이미 존재하는 부서명")) {
      return NextResponse.json(
        { error: errorMessage },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: errorMessage || "부서 생성에 실패했습니다" },
      { status: 500 }
    );
  }
}