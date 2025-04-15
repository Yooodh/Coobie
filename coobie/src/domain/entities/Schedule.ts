import { ScheduleCategory } from "./ScheduleCategory";

export class Schedule {
  constructor(
    id: number,
    userId: string,
    startAt: Date,
    date: Date,
    deletedAt: Date | null,
    scheduleCategoryId: number,
    category?: ScheduleCategory // optional relation
  ) {}
}
