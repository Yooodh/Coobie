// application/usecases/schedule/dto/FetchSchedulesDto.ts
import { Schedule } from "@/domain/entities/Schedule";
import { MoveScheduleToCategoryDto } from "./MoveScheduleToCategoryDto";

export class FetchSchedulesDto {
  constructor(
    public id: number,
    public userId: string,
    public startAt: Date,
    public date: Date,
    public deletedAt: Date | null,
    public scheduleCategoryId: number,
    public category?: MoveScheduleToCategoryDto
  ) {}
}

// 매퍼 함수
export function toFetchSchedulesDto(schedule: Schedule): FetchSchedulesDto {
  return new FetchSchedulesDto(
    schedule.id,
    schedule.userId,
    schedule.startAt,
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
