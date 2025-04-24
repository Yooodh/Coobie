export class ScheduleRepositoryError extends Error {
  constructor(message: string) {
    super(`[ScheduleRepository] ${message}`);
    this.name = "ScheduleRepositoryError";
  }
}
