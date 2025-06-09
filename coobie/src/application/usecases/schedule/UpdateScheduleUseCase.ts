import { Schedule } from "@/domain/entities/Schedule";
import { ScheduleRepository } from "@/domain/repositories/ScheduleRepository";

// 전용 에러 클래스
export class UpdateScheduleError extends Error {
  constructor(message: string) {
    super(`[UpdateSchedule] ${message}`);
    this.name = "UpdateScheduleError";
  }
}

/**
 * 스케줄 업데이트 유스케이스
 * @param repository 스케줄 저장소
 * @param schedule 업데이트할 스케줄 정보
 * @returns 업데이트된 스케줄
 */
export async function updateScheduleUseCase(
  repository: ScheduleRepository,
  schedule: Schedule
): Promise<Schedule> {
  try {
    console.log(`[UpdateSchedule] 시작: 스케줄 ID ${schedule.id} 업데이트`);

    const updatedSchedule = await repository.updateSchedule(schedule);

    console.log(
      `[UpdateSchedule] 성공: 스케줄 ID ${schedule.id} 업데이트 완료`
    );
    return updatedSchedule;
  } catch (error) {
    console.error("[UpdateSchedule] 실패:", error);

    if (error instanceof Error) {
      throw new UpdateScheduleError(error.message);
    }
    throw new UpdateScheduleError("알 수 없는 오류가 발생했습니다");
  }
}
