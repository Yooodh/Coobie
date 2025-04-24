import { ScheduleRepository } from "@/domain/repositories/ScheduleRepository";
import {
  DeleteScheduleDto,
  toDeleteScheduleDto,
} from "./dto/DeleteScheduleDto";

// 전용 에러 클래스
export class DeleteScheduleError extends Error {
  constructor(message: string) {
    super(`[DeleteSchedule] ${message}`);
    this.name = "DeleteScheduleError";
  }
}

// 입력 타입 정의 - userId 추가
export interface DeleteScheduleInput {
  userId: string;
  scheduleId: number;
}

// 함수형 유스케이스
export async function deleteScheduleUseCase(
  repository: ScheduleRepository,
  { userId, scheduleId }: DeleteScheduleInput // 객체 구조 분해 사용
): Promise<DeleteScheduleDto> {
  try {
    // userId와 scheduleId 모두 전달
    const deletedSchedule = await repository.deleteSchedule(userId, scheduleId);
    return toDeleteScheduleDto(deletedSchedule);
  } catch (error) {
    if (error instanceof Error) {
      throw new DeleteScheduleError(error.message);
    }
    throw new DeleteScheduleError("알 수 없는 오류가 발생했습니다");
  }
}
