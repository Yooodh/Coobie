// 커스텀 에러 클래스
export class ScheduleRepositoryError extends Error {
  constructor(message: string) {
    super(`[ScheduleRepository] ${message}`);
    this.name = "ScheduleRepositoryError";
  }
}
