// src/app/api/users/profile-image/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import { SbProfileImageRepository } from "@/infra/repositories/supabase/SbProfileImageRepository";
import { ProfileImageUseCase } from "@/application/usecases/user/ProfileImageUseCase";

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

// GET: Get current user's profile image URL
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

    // URL 쿼리 파라미터에서 userId 추출 (없으면 현재 사용자 ID 사용)
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || tokenData.userId;

    // Use case 실행
    const profileImageRepository = new SbProfileImageRepository();
    const profileImageUseCase = new ProfileImageUseCase(profileImageRepository);
    
    const imageUrl = await profileImageUseCase.getProfileImageUrl(userId);
    
    return NextResponse.json({ imageUrl });
  } catch (error: any) {
    console.error("프로필 이미지 조회 중 오류 발생:", error);
    return NextResponse.json(
      { error: "프로필 이미지 조회 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

// POST: Upload profile image
export async function POST(request: NextRequest) {
  try {
    // 토큰 검증
    const token = (await cookies()).get("auth_token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "인증되지 않은 요청입니다" },
        { status: 401 }
      );
    }

    const tokenData = getTokenData(token);
    if (!tokenData || !tokenData.userId) {
      return NextResponse.json(
        { error: "유효하지 않은 토큰입니다" },
        { status: 401 }
      );
    }

    // 파일 처리
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: "이미지 파일을 찾을 수 없습니다" },
        { status: 400 }
      );
    }

    // 이미지 업로드
    const profileImageRepository = new SbProfileImageRepository();
    const profileImage = await profileImageRepository.uploadImage(tokenData.userId, file);
    
    return NextResponse.json({ 
      message: "프로필 이미지가 성공적으로 업로드되었습니다",
      imageUrl: profileImage.fileUrl
    });
  } catch (error: any) {
    console.error("프로필 이미지 업로드 중 오류 발생:", error);
    return NextResponse.json(
      { error: error.message || "프로필 이미지 업로드 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}


// DELETE: Remove profile image
export async function DELETE(request: NextRequest) {
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

    // Use case 실행
    const profileImageRepository = new SbProfileImageRepository();
    const profileImageUseCase = new ProfileImageUseCase(profileImageRepository);
    
    await profileImageUseCase.deleteProfileImage(tokenData.userId);
    
    return NextResponse.json({ 
      message: "프로필 이미지가 성공적으로 삭제되었습니다" 
    });
  } catch (error: any) {
    console.error("프로필 이미지 삭제 중 오류 발생:", error);
    return NextResponse.json(
      { error: "프로필 이미지 삭제 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}