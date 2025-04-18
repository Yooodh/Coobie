// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { SbUserRepository } from "@/infra/repositories/supabase/SbUserRepository";
import { AuthenticateUserUseCase } from "@/application/usecases/auth/AuthenticateUserUseCase";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // 필수 필드 검증
    if (!username || !password) {
      return NextResponse.json(
        { error: "사용자명과 비밀번호를 입력해주세요" },
        { status: 400 }
      );
    }

    // 저장소 및 유스케이스 초기화
    const userRepository = new SbUserRepository();
    const authenticateUserUseCase = new AuthenticateUserUseCase(userRepository);

    // 사용자 인증
    const { user, token } = await authenticateUserUseCase.execute(username, password);
    console.log("로그인 시도:", username);

    // 토큰을 쿠키에 저장
    cookies().set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1주일
      path: "/",
    });

    // 사용자 정보에서 비밀번호 제외
    const { password: _, ...safeUserData } = user;

    return NextResponse.json({
      message: "로그인 성공",
      user: safeUserData,
    });
  } catch (error: any) {
    console.error("로그인 중 오류 발생:", error);
    
    // 로그인 시도 실패 시 오류 메시지
    if (error.message === "USER_NOT_FOUND") {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다" },
        { status: 404 }
      );
    } else if (error.message === "INVALID_PASSWORD") {
      return NextResponse.json(
        { error: "비밀번호가 일치하지 않습니다" },
        { status: 401 }
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
    }

    return NextResponse.json(
      { error: "로그인에 실패했습니다" },
      { status: 500 }
    );
  }
}