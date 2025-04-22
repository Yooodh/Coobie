// /app/api/auth/root/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sign } from "jsonwebtoken";
import { SbUserRepository } from "@/infra/repositories/supabase/SbUserRepository";
import { RootLoginUseCase } from "@/application/usecases/auth/RootLoginUseCase";
import { AuthUserDto } from "@/application/usecases/auth/dto/AuthUserDto";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // 필수 필드 검증
    if (!username || !password) {
      return NextResponse.json(
        { error: "아이디와 비밀번호를 입력해주세요" },
        { status: 400 }
      );
    }

    // 저장소 및 유스케이스 초기화
    const userRepository = new SbUserRepository();
    const rootLoginUseCase = new RootLoginUseCase(userRepository);

    try {
      // 루트 관리자 인증 시도
      const { user, token } = await rootLoginUseCase.execute(username, password);

      // 사용자 정보에서 비밀번호 제외
      const authUser: AuthUserDto = {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        roleId: user.roleId,
        businessNumber: user.businessNumber,
      };

      const response = NextResponse.json({
        user: authUser,
        redirectUrl: "/root/dashboard",
      });

      // 쿠키에 JWT 토큰 저장
      response.cookies.set("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1주일
        path: "/",
      });

      return response;
    } catch (error: any) {
      // 특정 오류 처리
      if (error.message === "USER_NOT_FOUND") {
        return NextResponse.json(
          { error: "사용자를 찾을 수 없습니다" },
          { status: 404 }
        );
      } else if (error.message === "NOT_ROOT_ADMIN") {
        return NextResponse.json(
          { error: "루트 관리자 권한이 없습니다" },
          { status: 403 }
        );
      } else if (error.message === "INVALID_PASSWORD") {
        return NextResponse.json(
          { error: "비밀번호가 일치하지 않습니다" },
          { status: 401 }
        );
      }
      throw error; // 처리되지 않은 오류는 다시 던짐
    }
  } catch (error: any) {
    console.error("루트 관리자 로그인 중 오류 발생:", error);
    return NextResponse.json(
      { error: "로그인에 실패했습니다" },
      { status: 500 }
    );
  }
}