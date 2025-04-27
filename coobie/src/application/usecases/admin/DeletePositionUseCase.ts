import { PositionRepository } from "@/domain/repositories/PositionRepository";

export class DeletePositionUseCase {
  constructor(private positionRepository: PositionRepository) {}

  async execute(positionId: number): Promise<void> {
    if (!positionId || isNaN(positionId)) {
      throw new Error("유효한 직급 ID가 제공되지 않았습니다");
    }

    try {
      await this.positionRepository.delete(positionId);
    } catch (error) {
      console.error("직급 삭제 중 오류 발생:", error);
      throw new Error(error instanceof Error ? error.message : "직급 삭제에 실패했습니다");
    }
  }
}