import { DepartmentRepository } from "@/domain/repositories/DepartmentRepository";

export class DeleteDepartmentUseCase {
  constructor(private departmentRepository: DepartmentRepository) {}

  async execute(departmentId: number): Promise<void> {
    if (!departmentId || isNaN(departmentId)) {
      throw new Error("유효한 부서 ID가 제공되지 않았습니다");
    }

    try {
      await this.departmentRepository.delete(departmentId);
    } catch (error) {
      console.error("부서 삭제 중 오류 발생:", error);
      throw new Error(error instanceof Error ? error.message : "부서 삭제에 실패했습니다");
    }
  }
}