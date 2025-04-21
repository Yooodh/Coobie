import { DepartmentRepository } from "@/domain/repositories/DepartmentRepository";
import { PositionRepository } from "@/domain/repositories/PositionRepository";

export class FetchDepartmentsAndPositionsUseCase {
  constructor(
    private departmentRepository: DepartmentRepository,
    private positionRepository: PositionRepository
  ) {}

  async execute(companyId: string) {
    const departments = await this.departmentRepository.getAllByCompany(
      companyId
    );
    const positions = await this.positionRepository.getAllByCompany(companyId);
    return { departments, positions };
  }
}
