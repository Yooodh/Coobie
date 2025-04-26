// src/app/api/profile-image/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import { SbProfileImageRepository } from "@/infra/repositories/supabase/SbProfileImageRepository";
import { UploadProfileImageUseCase } from "@/application/usecases/profileImage/UploadProfileImageUseCase";
import { GetProfileImageUseCase } from "@/application/usecases/profileImage/GetProfileImageUseCase";
import { DeleteProfileImageUseCase } from "@/application/usecases/profileImage/DeleteProfileImageUseCase";

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

// GET: 프로필 이미지 조회
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
    const getProfileImageUseCase = new GetProfileImageUseCase(profileImageRepository);
    
    const profileImage = await getProfileImageUseCase.execute(userId);
    
    return NextResponse.json({ 
      success: true,
      profileImage
    });
  } catch (error: any) {
    console.error("프로필 이미지 조회 중 오류 발생:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "프로필 이미지 조회 중 오류가 발생했습니다" 
      },
      { status: 500 }
    );
  }
}

// POST: 프로필 이미지 업로드
export async function POST(request: NextRequest) {
  try {
    // 토큰 검증
    const token = (await cookies()).get("auth_token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: "인증되지 않은 요청입니다" },
        { status: 401 }
      );
    }

    const tokenData = getTokenData(token);
    if (!tokenData || !tokenData.userId) {
      return NextResponse.json(
        { success: false, error: "유효하지 않은 토큰입니다" },
        { status: 401 }
      );
    }

    // 파일 처리
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: "이미지 파일을 찾을 수 없습니다" },
        { status: 400 }
      );
    }

    // 이미지 업로드
    const profileImageRepository = new SbProfileImageRepository();
    const uploadProfileImageUseCase = new UploadProfileImageUseCase(profileImageRepository);
    
    const result = await uploadProfileImageUseCase.execute(tokenData.userId, file);
    
    if (!result.success) {
      return NextResponse.json({ 
        success: false,
        error: result.message
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      success: true,
      message: result.message,
      profileImage: result.profileImage
    });
  } catch (error: any) {
    console.error("프로필 이미지 업로드 중 오류 발생:", error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || "프로필 이미지 업로드 중 오류가 발생했습니다" 
      },
      { status: 500 }
    );
  }
}

// DELETE: 프로필 이미지 삭제
export async function DELETE(request: NextRequest) {
  try {
    // 쿠키에서 토큰 가져오기
    const token = (await cookies()).get("auth_token")?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: "인증되지 않은 요청입니다" },
        { status: 401 }
      );
    }

    // 토큰 검증
    const tokenData = getTokenData(token);
    if (!tokenData) {
      return NextResponse.json(
        { success: false, error: "유효하지 않은 토큰입니다" },
        { status: 401 }
      );
    }

    // Use case 실행
    const profileImageRepository = new SbProfileImageRepository();
    const deleteProfileImageUseCase = new DeleteProfileImageUseCase(profileImageRepository);
    
    const result = await deleteProfileImageUseCase.execute(tokenData.userId);
    
    if (!result.success) {
      return NextResponse.json({ 
        success: false,
        error: result.message 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      success: true,
      message: result.message 
    });
  } catch (error: any) {
    console.error("프로필 이미지 삭제 중 오류 발생:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "프로필 이미지 삭제 중 오류가 발생했습니다" 
      },
      { status: 500 }
    );
  }
}