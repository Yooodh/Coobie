import { Schedule } from "@/domain/entities/Schedule";
import { ScheduleRepository } from "@/domain/repositories/ScheduleRepository";

export class UpdateScheduleUseCase {
  constructor(private scheduleRepository: ScheduleRepository) {}

  async execute(schedule: Schedule): Promise<Schedule> {
    return this.scheduleRepository.updateSchedule(schedule);
  }
}
