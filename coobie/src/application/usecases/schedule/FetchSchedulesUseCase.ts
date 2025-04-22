import { ScheduleRepository } from "@/domain/repositories/ScheduleRepository";
import { Schedule } from "@/domain/entities/Schedule";
import {
  FetchSchedulesDto,
  toFetchSchedulesDto,
} from "./dto/FetchSchedulesDto";

// 유스케이스 전용 에러 클래스
export class FetchSchedulesError extends Error {
  constructor(message: string) {
    super(`[FetchSchedules] ${message}`);
    this.name = "FetchSchedulesError";
  }
}

export async function fetchSchedulesUseCase(
  repository: ScheduleRepository
): Promise<FetchSchedulesDto[]> {
  try {
    // 로깅 추가 (개발/디버깅용)
    console.log("[FetchSchedules] 시작: 스케줄 목록 조회");

    const schedules = await repository.fetchSchedules();

    // 도메인 엔티티를 DTO로 변환
    const scheduleDtos = schedules.map(toFetchSchedulesDto);

    console.log(
      `[FetchSchedules] 성공: ${scheduleDtos.length}개 스케줄 조회됨`
    );
    return scheduleDtos;
  } catch (error) {
    console.error("[FetchSchedules] 실패:", error);

    if (error instanceof Error) {
      throw new FetchSchedulesError(error.message);
    }
    throw new FetchSchedulesError("알 수 없는 오류가 발생했습니다");
  }
}
