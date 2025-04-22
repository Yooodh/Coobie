import { Schedule } from "@/domain/entities/Schedule";
import { MoveScheduleToCategoryDto } from "./MoveScheduleToCategoryDto";

export class FetchSchedulesDto {
  constructor(
    public readonly id: number,
    public readonly userId: string,
    public readonly startedAt: Date,
    public readonly endedAt: Date,
    public readonly date: Date,
    public readonly deletedAt: Date | null,
    public readonly scheduleCategoryId: number,
    public readonly category?: MoveScheduleToCategoryDto
  ) {}
}

// 매퍼 함수
export function toFetchSchedulesDto(schedule: Schedule): FetchSchedulesDto {
  return new FetchSchedulesDto(
    schedule.id,
    schedule.userId,
    schedule.startedAt,
    schedule.endedAt,
    schedule.date,
    schedule.deletedAt,
    schedule.scheduleCategoryId,
    schedule.category
      ? new MoveScheduleToCategoryDto(
          schedule.category.id,
          schedule.category.scheduleType
        )
      : undefined
  );
}
