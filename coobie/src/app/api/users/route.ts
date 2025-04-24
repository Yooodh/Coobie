import { NextRequest, NextResponse } from "next/server";
import { SbUserRepository } from "@/infra/repositories/supabase/SbUserRepository";
import { CreateUserUseCase } from "@/application/usecases/user/CreateUserUsecase";
import { GetUserUseCase } from "@/application/usecases/user/GetUserUseCase";
import { UserFilter } from "@/domain/repositories/filters/UserFilter";

// 오류 타입 정의
interface ErrorWithMessage {
  message: string;
}

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as Record<string, unknown>).message === "string"
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

// GET 핸들러 (사용자 목록 조회) - 변경 없음
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // 필터 매개변수 추출
    const username = searchParams.get("username") || undefined;
    const nickname = searchParams.get("nickname") || undefined;
    const departmentId = searchParams.get("departmentId")
      ? parseInt(searchParams.get("departmentId")!)
      : undefined;
    const positionId = searchParams.get("positionId")
      ? parseInt(searchParams.get("positionId")!)
      : undefined;
    const status = searchParams.get("status") as
      | "online"
      | "offline"
      | "busy"
      | "away"
      | undefined;
    const roleId = searchParams.get("roleId") || undefined;
    const isLocked = searchParams.has("isLocked")
      ? searchParams.get("isLocked") === "true"
      : undefined;
    const isApproved = searchParams.has("isApproved")
      ? searchParams.get("isApproved") === "true"
      : undefined;

    const businessNumber = searchParams.get("businessNumber") || undefined;

    // 페이지네이션
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // 필터 객체 생성
    const filter = new UserFilter(
      username,
      nickname,
      departmentId,
      positionId,
      status,
      roleId,
      isLocked,
      isApproved,
      businessNumber,
      offset,
      limit
    );

    console.log("요청 파라미터:", {
      username,
      nickname,
      departmentId,
      positionId,
      status,
      roleId,
      isLocked,
      isApproved,
      businessNumber // 이 값이 올바르게 전달되는지 확인
    });
    
    // 필터 객체 생성 후
    console.log("생성된 필터:", filter);



    // 저장소 및 유스케이스 초기화
    const userRepository = new SbUserRepository();
    const getUserUseCase = new GetUserUseCase(userRepository);

    // 페이지네이션을 포함한 사용자 목록 조회
    const result = await getUserUseCase.getAll(filter);

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("사용자 목록 조회 중 오류 발생:", error);
    return NextResponse.json(
      {
        error:
          getErrorMessage(error) || "사용자 목록을 불러오는데 실패했습니다",
      },
      { status: 500 }
    );
  }
}

// POST 핸들러 (사용자 생성) - ID 필드를 선택적으로 수정
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      username,
      nickname,
      password,
      departmentId,
      positionId,
      roleId,
      businessNumber,
    } = body;

    // 필수 필드 검증
    if (!username || !nickname || !password) {
      return NextResponse.json(
        { error: "사용자명, 닉네임, 비밀번호는 필수 입력 항목입니다" },
        { status: 400 }
      );
    }

    // 사업자 번호 검증 추가
    if (!businessNumber) {
      return NextResponse.json(
        { error: "사업자 번호는 필수 입력 항목입니다." },
        { status: 400 }
      );
    }

    // 저장소 및 유스케이스 초기화
    const userRepository = new SbUserRepository();
    const createUserUseCase = new CreateUserUseCase(userRepository);

    // 사용자 생성 - ID가 제공되지 않은 경우 Supabase가 자동으로 생성
    const newUser = await createUserUseCase.execute(
      id, // ID가 제공되지 않으면 undefined로 전달
      username,
      nickname,
      password,
      departmentId,
      positionId,
      roleId || "02", // roleId가 제공되지 않으면 기본값 "02" 사용
      businessNumber
    );

    return NextResponse.json(newUser, { status: 201 });
  } catch (error: unknown) {
    console.error("사용자 생성 중 오류 발생:", error);
    return NextResponse.json(
      { error: getErrorMessage(error) || "사용자 생성에 실패했습니다" },
      { status: 500 }
    );
  }
}
