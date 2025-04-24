import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    (await cookieStore).delete("auth_token");

    return NextResponse.json({
      success: true,
      message: "로그아웃 되었습니다.",
    });
  } catch (error: unknown) {
    console.error("로그아웃 처리 중 오류 발생:", error);
    return NextResponse.json(
      { success: false, error: "로그아웃 처리 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
