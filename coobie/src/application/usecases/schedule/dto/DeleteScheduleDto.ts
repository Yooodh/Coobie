import { Schedule } from "@/domain/entities/Schedule";

export class DeleteScheduleDto {
  constructor(
    public readonly id: number,
    public readonly deletedAt: Date | null
  ) {}
}

// 매퍼 함수
export function toDeleteScheduleDto(schedule: Schedule): DeleteScheduleDto {
  return new DeleteScheduleDto(schedule.id, schedule.deletedAt ?? null);
}
