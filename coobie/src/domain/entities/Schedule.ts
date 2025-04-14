import { ScheduleCategory } from "./ScheduleCategory";

export class Schedule {
  constructor(
    id: number,
    userId: string,
    startAt: Date,
    date: Date,
    deleteAt: Date | null,
    scheduleCategoryId: number,
    category?: ScheduleCategory // optional relation
  ) {}
}
