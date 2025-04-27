// import { NextRequest, NextResponse } from "next/server";
// import { SbUserRepository } from "@/infra/repositories/supabase/SbUserRepository";
// import { UpdateUserUseCase } from "@/application/usecases/user/UpdateUserUseCase";

// // 오류 타입 정의
// interface ErrorWithMessage {
//   message: string;
// }

// function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
//   return (
//     typeof error === 'object' &&
//     error !== null &&
//     'message' in error &&
//     typeof (error as Record<string, unknown>).message === 'string'
//   );
// }

// function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
//   if (isErrorWithMessage(maybeError)) return maybeError;
  
//   try {
//     return new Error(JSON.stringify(maybeError));
//   } catch {
//     // 직렬화할 수 없는 경우 기본 오류 메시지 사용
//     return new Error(String(maybeError));
//   }
// }

// function getErrorMessage(error: unknown): string {
//   return toErrorWithMessage(error).message;
// }

// export async function PATCH(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const userId = params.id;
//     const { isLocked } = await request.json();
    
//     if (isLocked === undefined) {
//       return NextResponse.json(
//         { error: "잠금 상태 값(isLocked)은 필수 입력 항목입니다" },
//         { status: 400 }
//       );
//     }
    
//     // 저장소 및 유스케이스 초기화
//     const userRepository = new SbUserRepository();
//     const updateUserUseCase = new UpdateUserUseCase(userRepository);

//     // 잠금 상태 업데이트
//     await updateUserUseCase.updateLockStatus(userId, isLocked);
    
//     return NextResponse.json({
//       message: `ID가 ${userId}인 사용자의 잠금 상태가 성공적으로 ${isLocked ? '잠금' : '해제'}되었습니다`
//     });
//   } catch (error: unknown) {
//     console.error(`잠금 상태 변경 중 오류 발생 (ID: ${params.id}):`, error);
//     return NextResponse.json(
//       { error: getErrorMessage(error) || "잠금 상태 변경에 실패했습니다" },
//       { status: 500 }
//     );
//   }
// }


// src/app/api/users/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import { SbUserRepository } from "@/infra/repositories/supabase/SbUserRepository";

// 토큰에서 사용자 정보 추출
function getTokenData(token: string) {
  try {
    const jwtSecret = process.env.JWT_SECRET || "default-jwt-secret";
    return verify(token, jwtSecret) as {
      userId: string;
      username: string;
      roleId: string;
    };
  } catch (error) {
    return null;
  }
}

// PATCH: Update user status
export async function PATCH(request: NextRequest) {
  try {
    // 쿠키에서 토큰 가져오기
    const token = (await cookies()).get("auth_token")?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: "인증되지 않은 요청입니다" },
        { status: 401 }
      );
    }

    // 토큰 검증
    const tokenData = getTokenData(token);
    if (!tokenData) {
      return NextResponse.json(
        { error: "유효하지 않은 토큰입니다" },
        { status: 401 }
      );
    }

    // 요청 본문에서 상태 정보 추출
    const { status } = await request.json();

    // 상태값 검증
    if (!status || !['online', 'offline', 'busy', 'away'].includes(status)) {
      return NextResponse.json(
        { error: "유효하지 않은 상태값입니다" },
        { status: 400 }
      );
    }

    // 사용자 저장소 초기화
    const userRepository = new SbUserRepository();
    
    // 사용자 상태 업데이트
    await userRepository.updateStatus(tokenData.userId, status);
    
    return NextResponse.json({
      message: "사용자 상태가 성공적으로 업데이트되었습니다",
      status
    });
  } catch (error: any) {
    console.error("사용자 상태 업데이트 중 오류 발생:", error);
    return NextResponse.json(
      { error: "사용자 상태 업데이트 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}