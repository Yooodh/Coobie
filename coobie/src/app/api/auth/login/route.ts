// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { LoginRequestDto } from "@/application/usecases/auth/dto/LoginRequestDto";
import { AuthUserDto } from "@/application/usecases/auth/dto/AuthUserDto";
import { AuthResponseDto } from "@/application/usecases/auth/dto/AuthResponseDto";
import { SbUserRepository } from "@/infra/repositories/supabase/SbUserRepository";
import { AuthenticateUserUseCase } from "@/application/usecases/auth/AuthenticateUserUseCase";

const MAX_LOGIN_ATTEMPTS = 5;

export async function POST(request: NextRequest) {
  try {
    const loginRequest: LoginRequestDto = await request.json();
    const { username, password } = loginRequest;

    // 필수 필드 검증
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
      // 사용자 찾기
      const user = await userRepository.findByUsername(username);

      // 사용자가 없는 경우 처리
      if (!user) {
        return NextResponse.json(
          { error: "사용자를 찾을 수 없습니다" },
          { status: 404 }
        );
      }

      // 이미 계정이 잠겨있는 경우 처리
      if (user.isLocked) {
        return NextResponse.json(
          { error: "계정이 잠겨 있습니다. 관리자에게 문의하세요" },
          { status: 403 }
        );
      }

      const { user: authenticatedUser, token } =
        await authenticateUserUseCase.execute(username, password);

      // 인증 성공 - 로그인 횟수 초기화
      await userRepository.resetLoginAttempts(authenticatedUser.id);

      // 로그인 성공 시 사용자 상태를 "online"으로 업데이트 (추가된 코드)
      await userRepository.updateStatus(authenticatedUser.id, "online");

      // 역할에 따라 리디렉션 URL 제공
      let redirectUrl = "/";
      if (authenticatedUser.roleId === "00") {
        redirectUrl = "/root/dashboard";
      } else if (authenticatedUser.roleId === "01") {
        redirectUrl = "/admin/users";
      } else {
        redirectUrl = "/user/dashboard";
      }

      // 사용자 정보에서 비밀번호 제외
      const authUser: AuthUserDto = {
        id: authenticatedUser.id,
        username: authenticatedUser.username,
        nickname: authenticatedUser.nickname,
        roleId: authenticatedUser.roleId,
        businessNumber: authenticatedUser.businessNumber,
        status: "online"
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
        // 사용자를 다시 가져와 로그인 시도 횟수 확인
        const user = await userRepository.findByUsername(username);
        if (!user) {
          return NextResponse.json(
            { error: "사용자를 찾을 수 없습니다" },
            { status: 404 }
          );
        }

        // 로그인 시도 횟수 증가
        const loginAttempts = await userRepository.incrementLoginAttempts(
          user.id
        );
        console.log(
          `사용자 ${username}의 로그인 시도 횟수: ${loginAttempts}/${MAX_LOGIN_ATTEMPTS}`
        );

        // 최대 시도 횟수를 초과한 경우 계정 잠금
        if (loginAttempts >= MAX_LOGIN_ATTEMPTS) {
          await userRepository.updateLockStatus(user.id, true);
          return NextResponse.json(
            {
              error: `비밀번호 ${MAX_LOGIN_ATTEMPTS}회 이상 틀려 계정이 잠겼습니다. 관리자에게 문의하세요`,
            },
            { status: 403 }
          );
        }

        // 남은 시도 횟수 알림
        const remainingAttempts = MAX_LOGIN_ATTEMPTS - loginAttempts;
        return NextResponse.json(
          {
            error: `비밀번호가 일치하지 않습니다. 남은 시도 횟수: ${remainingAttempts}회`,
          },
          { status: 401 }
        );
      }
      throw error; // 처리되지 않은 오류는 다시 던짐
    }
  } catch (error: any) {
    console.error("로그인 중 오류 발생:", error);
    return NextResponse.json(
      { error: "로그인에 실패했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }
}
