import { NextRequest, NextResponse } from "next/server";
import { MoveScheduleToCategoryUseCase } from "@/application/usecases/schedule/MoveScheduleToCategoryUseCase";
import { SbScheduleRepository } from "@/infra/repositories/supabase/SbScheduleRepository";

export async function POST(request: NextRequest) {
  // 클라이언트에서 들어온 POST 요청을 처리하는 비동기 함수.

  try {
    // 예외 처리
    const body = await request.json();
    // 요청(request) 본문을 JSON 형태로 파싱

    const { scheduleId, newCategoryId } = body;
    // 파싱된 JSON에서 scheduleId와 newCategoryId를 구조 분해 할당.

    // scheduleId와 newCategoryId가 유효한 숫자인지 확인
    if (typeof scheduleId !== "number" || typeof newCategoryId !== "number") {
      // 타입이 숫자가 아닌 경우 에러 응답을 반환.

      return NextResponse.json(
        { error: "scheduleId와 newCategoryId는 숫자여야 합니다." }, // 클라이언트에게 보낼 에러 메시지
        { status: 400 } // HTTP 상태 코드 400 (Bad Request)
      );
    }

    const repository = new SbScheduleRepository();
    // Supabase를 사용하는 스케줄 리포지토리 인스턴스를 생성합니다.

    const updatedScheduleDto = await MoveScheduleToCategoryUseCase(repository, {
      scheduleId,
      newCategoryId,
    });
    // 유스케이스에 repository와 파라미터를 전달하여 스케줄을 새 카테고리로 이동.
    // 결과는 업데이트된 스케줄 정보(DTO).

    return NextResponse.json({ data: updatedScheduleDto });
    // 성공 시 클라이언트에게 업데이트된 스케줄 정보를 JSON 형식으로 응답.
  } catch (error) {
    // 위 과정에서 에러가 발생한 경우 실행.

    console.error("MoveScheduleToCategory 에러:", error);
    // 서버 콘솔에 에러 내용을 출력.

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? `서버 에러: ${error.message}` // 에러 객체가 Error 타입일 경우 상세 메시지를 포함해 응답
            : "알 수 없는 에러가 발생했습니다.", // 그 외의 경우 일반적인 에러 메시지 응답
      },
      { status: 500 } // HTTP 상태 코드 500 (Internal Server Error)
    );
  }
}
