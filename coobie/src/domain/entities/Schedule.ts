import { ScheduleCategory } from "./ScheduleCategory";

export class Schedule {
  constructor(
    public id: number,
    public userId: string,
    public startAt: Date,
    public date: Date,
    public deletedAt: Date | null,
    public scheduleCategoryId: number,
    public category?: ScheduleCategory // optional relation
  ) {}
}
