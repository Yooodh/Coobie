// application/usecases/schedule/dto/FetchScheduleCategoryDto.ts
import { ScheduleCategory } from "@/domain/entities/ScheduleCategory";

export class FetchScheduleCategoryDto {
  constructor(
    public readonly id: number,
    public readonly scheduleType: string
  ) {}
}

/**
 * 도메인 엔티티에서 DTO로 변환하는 매퍼 함수
 */
export function toFetchScheduleCategoryDto(
  category: ScheduleCategory
): FetchScheduleCategoryDto {
  return new FetchScheduleCategoryDto(category.id, category.scheduleType);
}
