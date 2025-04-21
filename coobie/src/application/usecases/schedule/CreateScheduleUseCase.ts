// src/application/usecases/schedule/CreateScheduleUseCase.ts
import { ScheduleRepository } from "@/domain/repositories/ScheduleRepository";
import { Schedule } from "@/domain/entities/Schedule";
import {
  CreateScheduleDto,
  toCreateScheduleDto,
} from "./dto/CreateScheduleDto";

// 전용 에러 클래스
export class CreateScheduleError extends Error {
  constructor(message: string) {
    super(`[CreateSchedule] ${message}`);
    this.name = "CreateScheduleError";
  }
}

// 유스케이스에 필요한 입력 타입 정의
export interface CreateScheduleInput {
  userId: string;
  startedAt: Date;
  endedAt: Date;
  date: Date;
  scheduleCategoryId: number;
}

// 함수형 유스케이스
export async function createScheduleUseCase(
  repository: ScheduleRepository,
  input: CreateScheduleInput
): Promise<CreateScheduleDto> {
  try {
    console.log("[CreateSchedule] 시작: 새 스케줄 생성");

    const newSchedule = new Schedule(
      0, // DB에서 자동 생성될 ID

      // input.userId,
      "37002d5e-1c5d-4797-8190-dc2adeea2637",
      input.startedAt,
      input.endedAt,
      input.date,
      null, // deletedAt
      input.scheduleCategoryId
      // name, isTemporary 등 불필요한 인자 제거
    );

    const createdSchedule = await repository.createSchedule(newSchedule);
    console.log(
      `[CreateSchedule] 성공: 스케줄 ID ${createdSchedule.id} 생성됨`
    );

    return toCreateScheduleDto(createdSchedule);
  } catch (error) {
    console.error("[CreateSchedule] 실패:", error);
    if (error instanceof Error) {
      throw new CreateScheduleError(error.message);
    }
    throw new CreateScheduleError("알 수 없는 오류가 발생했습니다");
  }
}
