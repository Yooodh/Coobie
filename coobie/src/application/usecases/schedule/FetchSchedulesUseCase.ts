import { ScheduleRepository } from "@/domain/repositories/ScheduleRepository";

// Schedule 엔티티를 FetchSchedulesDto로 변환하는 함수와 DTO 타입 import
import {
  toFetchSchedulesDto, // Schedule 객체를 외부에서 사용할 수 있는 DTO로 변환
  FetchSchedulesDto, // 변환된 스케줄 데이터를 담는 타입
} from "./dto/FetchSchedulesDto";

// 스케줄 목록을 가져오는 유스케이스 함수 정의
export async function FetchSchedulesUseCase(
  repository: ScheduleRepository // 의존성 주입된 저장소 객체
): Promise<FetchSchedulesDto[]> {
  // 반환 타입은 FetchSchedulesDto 객체의 배열
  try {
    // 저장소에서 모든 스케줄을 가져옴 (도메인 엔티티 Schedule 배열 반환)
    const schedules = await repository.fetchSchedules();

    // 각 Schedule을 DTO로 변환하여 배열로 반환
    return schedules.map(toFetchSchedulesDto);
  } catch (error) {
    // 에러가 Error 인스턴스일 경우, 구체적인 메시지를 포함하여 예외 발생
    if (error instanceof Error) {
      throw new Error(`Error in fetchSchedulesUseCase: ${error.message}`);
    }

    // 그 외의 경우, 알 수 없는 에러로 처리
    throw new Error("Unknown error in fetchSchedulesUseCase");
  }
}
