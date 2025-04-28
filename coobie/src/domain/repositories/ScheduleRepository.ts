import { Schedule } from "../entities/Schedule";
import { ScheduleCategory } from "../entities/ScheduleCategory";

export interface ScheduleRepository {
  fetchSchedules(userId?: string): Promise<Schedule[]>;
  fetchScheduleCategories(): Promise<ScheduleCategory[]>;
  fetchScheduleCategoryById(id: number): Promise<ScheduleCategory>;
  moveScheduleToCategory(
    scheduleId: number,
    newCategoryId: number
  ): Promise<Schedule>;
  // moveScheduleCategory(
  //   id: number,
  //   newCategoryId: number
  // ): Promise<ScheduleCategory[]>;
  createSchedule(schedule: Schedule): Promise<Schedule>;
  deleteSchedule(userId: string, scheduleId: number): Promise<Schedule>;
  updateSchedule(schedule: Schedule): Promise<Schedule>;
}
