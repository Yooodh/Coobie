import { ScheduleRepository } from "@/domain/repositories/ScheduleRepository";
import {
  toFetchSchedulesDto,
  FetchSchedulesDto,
} from "./dto/FetchSchedulesDto";

// 유스케이스 전용 에러 클래스 추가
export class MoveScheduleToCategoryError extends Error {
  constructor(message: string) {
    super(`[MoveScheduleToCategory] ${message}`);
    this.name = "MoveScheduleToCategoryError";
  }
}

interface MoveScheduleToCategoryInput {
  scheduleId: number;
  newCategoryId: number;
}

export async function MoveScheduleToCategoryUseCase(
  repository: ScheduleRepository,
  { scheduleId, newCategoryId }: MoveScheduleToCategoryInput
): Promise<FetchSchedulesDto> {
  try {
    // 로깅 추가 (개발/디버깅용)
    console.log(
      `[MoveScheduleToCategory] 시작: 스케줄 ID ${scheduleId}를 카테고리 ID ${newCategoryId}로 이동`
    );

    const updatedSchedule = await repository.moveScheduleToCategory(
      scheduleId,
      newCategoryId
    );

    console.log(
      `[MoveScheduleToCategory] 성공: 스케줄 ID ${scheduleId} 이동 완료`
    );
    return toFetchSchedulesDto(updatedSchedule);
  } catch (error) {
    console.error(`[MoveScheduleToCategory] 실패:`, error);

    if (error instanceof Error) {
      throw new MoveScheduleToCategoryError(error.message);
    }
    throw new MoveScheduleToCategoryError("알 수 없는 오류가 발생했습니다");
  }
}
