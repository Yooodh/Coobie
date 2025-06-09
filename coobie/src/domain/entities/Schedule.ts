import { ScheduleCategory } from "./ScheduleCategory";

export class Schedule {
  constructor(
    public readonly id: number,
    public readonly userId: string,
    public readonly startedAt: Date,
    public readonly endedAt: Date,
    public readonly date: Date,
    public deletedAt: Date | null,
    public readonly scheduleCategoryId: number,
    public readonly category?: ScheduleCategory,
    public color?: string
  ) {}

  isDeleted() {
    return this.deletedAt !== null;
  }

  softDelete(date: Date = new Date()) {
    this.deletedAt = date;
  }
}

export interface DayColumn {
  date: Date;
  dayName: string;
  formattedDate: string;
}
