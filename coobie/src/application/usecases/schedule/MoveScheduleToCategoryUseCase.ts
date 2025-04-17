import { ScheduleRepository } from "@/domain/repositories/ScheduleRepository";

// DTO 변환 함수와 타입 import
import {
  toFetchSchedulesDto, // Schedule 엔티티를 FetchSchedulesDto 형태로 변환하는 함수
  FetchSchedulesDto, // 변환된 스케줄 데이터를 담는 DTO 타입
} from "./dto/FetchSchedulesDto";

// 유스케이스 함수에 전달될 입력 파라미터 타입 정의
interface MoveScheduleToCategoryInput {
  scheduleId: number; // 이동할 대상 스케줄의 ID
  newCategoryId: number; // 새로 이동할 카테고리 ID
}

// 스케줄을 다른 카테고리로 이동시키는 유스케이스 함수 정의
export async function MoveScheduleToCategoryUseCase(
  repository: ScheduleRepository, // 실제 구현체가 주입되는 ScheduleRepository
  { scheduleId, newCategoryId }: MoveScheduleToCategoryInput // 구조 분해로 파라미터 추출
): Promise<FetchSchedulesDto> {
  try {
    // 주어진 스케줄 ID의 항목을 새 카테고리로 이동시키고, 업데이트된 스케줄 반환
    const updatedSchedule = await repository.moveScheduleToCategory(
      scheduleId,
      newCategoryId
    );

    // 업데이트된 Schedule 객체를 FetchSchedulesDto 형식으로 변환하여 반환
    return toFetchSchedulesDto(updatedSchedule);
  } catch (error) {
    // Error 객체인 경우: 구체적인 에러 메시지 포함하여 예외 처리
    if (error instanceof Error) {
      throw new Error(
        `Error in MoveScheduleToCategoryUseCase: ${error.message}`
      );
    }
    // Error 객체가 아닌 경우: 알 수 없는 에러 처리
    throw new Error("Unknown error in MoveScheduleToCategoryUseCase");
  }
}
