// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { LoginRequestDto } from "@/application/usecases/auth/dto/LoginRequestDto";
import { AuthUserDto } from "@/application/usecases/auth/dto/AuthUserDto";
import { AuthResponseDto } from "@/application/usecases/auth/dto/AuthResponseDto";
import { SbUserRepository } from "@/infra/repositories/supabase/SbUserRepository";
import { AuthenticateUserUseCase } from "@/application/usecases/auth/AuthenticateUserUseCase";

export async function POST(request: NextRequest) {
  try {
    const loginRequest: LoginRequestDto = await request.json();
    const { username, password } = loginRequest;

    // 필수 필드 검증
    // if (!username || !password) {
    //   return NextResponse.json(
    //     { error: "사용자명과 비밀번호를 입력해주세요" },
    //     { status: 400 }
    //   );
    // }
    if (!username) {
      return NextResponse.json(
        { error: "사원번호를 입력해주세요" },
        { status: 400 }
      );
    }
    if (!password) {
      return NextResponse.json(
        { error: "비밀번호를 입력해주세요" },
        { status: 400 }
      );
    }

    // 저장소 및 유스케이스 초기화
    const userRepository = new SbUserRepository();
    const authenticateUserUseCase = new AuthenticateUserUseCase(userRepository);

    try {
      // 인증 시도
      const { user, token } = await authenticateUserUseCase.execute(
        username,
        password
      );
      // 역할에 따라 리디렉션 URL 제공
      let redirectUrl = "/";
      if (user.roleId === "00") {
        redirectUrl = "/root/dashboard";
      } else if (user.roleId === "01") {
        redirectUrl = "/admin/users";
      } else {
        redirectUrl = "/user/dashboard";
      }

      // 사용자 정보에서 비밀번호 제외
      const authUser: AuthUserDto = {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        roleId: user.roleId,
        businessNumber: user.businessNumber,
      };

      const authResponse: AuthResponseDto = {
        user: authUser,
        redirectUrl,
      };

      const response = NextResponse.json(authResponse);

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
      } else if (error.message === "ACCOUNT_LOCKED") {
        return NextResponse.json(
          { error: "계정이 잠겨 있습니다. 관리자에게 문의하세요" },
          { status: 403 }
        );
      } else if (error.message === "ACCOUNT_NOT_APPROVED") {
        return NextResponse.json(
          { error: "계정이 아직 승인되지 않았습니다" },
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
    console.error("로그인 중 오류 발생:", error);
    return NextResponse.json(
      { error: "로그인에 실패했습니다" },
      { status: 500 }
    );
  }
}
