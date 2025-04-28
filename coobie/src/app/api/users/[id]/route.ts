import { NextRequest, NextResponse } from "next/server";
import { SbUserRepository } from "@/infra/repositories/supabase/SbUserRepository";
import { GetUserUseCase } from "@/application/usecases/user/GetUserUseCase";
import { UpdateUserUseCase } from "@/application/usecases/user/UpdateUserUseCase";
import { DeleteUserUseCase } from "@/application/usecases/user/DeleteUserUseCase";

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


export async function GET(
  request: NextRequest,
  context: Promise<{ params: { id: string } }>
) {
  try {
    const { params } = await context;
    const userId = params.id;

    // 저장소 및 유스케이스 초기화
    const userRepository = new SbUserRepository();
    const getUserUseCase = new GetUserUseCase(userRepository);

    const user = await getUserUseCase.getById(userId);

    if (!user) {
      return NextResponse.json(
        { error: `ID가 ${userId}인 사용자를 찾을 수 없습니다` },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { error: "사용자 정보를 불러오는데 실패했습니다" },
      { status: 500 }
    );
  }
}


export async function PATCH(
  request: NextRequest,
  context: Promise<{ params: { id: string } }>
) {
  try {
    const { params } = await context;
    const userId = params.id;

    const body = await request.json();
    const updateData = { ...body, id: userId };

    const userRepository = new SbUserRepository();
    const updateUserUseCase = new UpdateUserUseCase(userRepository);

    const updatedUser = await updateUserUseCase.execute(updateData);

    return NextResponse.json(updatedUser);
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { error: "사용자 정보 업데이트에 실패했습니다" },
      { status: 500 }
    );
  }
}


export async function DELETE(
  request: NextRequest,
  context: Promise<{ params: { id: string } }>
) {
  try {
    const { params } = await context;
    const userId = params.id;

    const userRepository = new SbUserRepository();
    const deleteUserUseCase = new DeleteUserUseCase(userRepository);

    await deleteUserUseCase.execute(userId);

    return NextResponse.json({
      message: `ID가 ${userId}인 사용자가 성공적으로 삭제되었습니다`,
    });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { error: "사용자 삭제에 실패했습니다" },
      { status: 500 }
    );
  }
}
