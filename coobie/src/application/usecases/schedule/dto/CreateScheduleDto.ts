// application/usecases/schedule/dto/CreateScheduleDto.ts
import { Schedule } from "@/domain/entities/Schedule";

export class CreateScheduleDto {
  constructor(
    public readonly id: number,
    public readonly userId: string,
    public readonly startedAt: Date,
    public readonly endedAt: Date,
    public readonly date: Date,
    public readonly scheduleCategoryId: number
  ) {}
}

export function toCreateScheduleDto(schedule: Schedule): CreateScheduleDto {
  return new CreateScheduleDto(
    schedule.id,
    schedule.userId,
    schedule.startedAt,
    schedule.endedAt,
    schedule.date,
    schedule.scheduleCategoryId
  );
}
