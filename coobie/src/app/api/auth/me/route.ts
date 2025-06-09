// src/app/api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import { SbUserRepository } from "@/infra/repositories/supabase/SbUserRepository";
import { AuthUserDto } from "@/application/usecases/auth/dto/AuthUserDto";

// Dto 확장 했습니다 : Yoo
interface ExtendedAuthUserDto extends AuthUserDto {
  departmentId?: number;
  positionId?: number;
}

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

export async function GET(request: NextRequest) {
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

    // 사용자 정보 조회
    const userRepository = new SbUserRepository();
    const user = await userRepository.findById(tokenData.userId);

    if (!user) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // AuthUserDto로 변환하여 반환
    // const authUser: AuthUserDto = {
    //   id: user.id,
    //   username: user.username,
    //   nickname: user.nickname,
    //   roleId: user.roleId,
    //   businessNumber: user.businessNumber,
    // };

    // Dto 확장 했습니다 : Yoo
    const authUser: ExtendedAuthUserDto = {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      roleId: user.roleId,
      businessNumber: user.businessNumber,
      departmentId: user.departmentId,
      positionId: user.positionId,
    };

    return NextResponse.json({
      user: authUser,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("사용자 정보 조회 중 오류 발생:", error);
    }
    return NextResponse.json(
      { error: "사용자 정보 조회 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
