import { ScheduleRepository } from "@/domain/repositories/ScheduleRepository";
import {
  FetchScheduleCategoryDto,
  toFetchScheduleCategoryDto,
} from "./dto/FetchScheduleCategoriesDto";

//  스케줄 카테고리 조회 시 발생하는 에러 처리를 위한 클래스
export class FetchScheduleCategoriesError extends Error {
  constructor(message: string) {
    super(`[FetchScheduleCategories] ${message}`);
    this.name = "FetchScheduleCategoriesError";
  }
}

/**
 * 모든 스케줄 카테고리를 조회하는 유스케이스
 * @param repository 스케줄 레포지토리 인터페이스
 * @returns 스케줄 카테고리 DTO 배열
 */
export async function fetchScheduleCategoriesUseCase(
  repository: ScheduleRepository
): Promise<FetchScheduleCategoryDto[]> {
  try {
    console.log("[FetchScheduleCategories] 시작: 카테고리 목록 조회");

    const categories = await repository.fetchScheduleCategories();
    const categoryDtos = categories.map(toFetchScheduleCategoryDto);

    console.log(
      `[FetchScheduleCategories] 성공: ${categoryDtos.length}개 카테고리 조회됨`
    );
    return categoryDtos;
  } catch (error) {
    console.error("[FetchScheduleCategories] 실패:", error);

    if (error instanceof Error) {
      throw new FetchScheduleCategoriesError(error.message);
    }
    throw new FetchScheduleCategoriesError("알 수 없는 오류가 발생했습니다");
  }
}
