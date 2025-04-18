// src/application/usecases/company/DeleteCompanyUseCase.ts
import { CompanyRepository } from "@/domain/repositories/CompanyRepository";

export class DeleteCompanyUseCase {
  constructor(private companyRepository: CompanyRepository) {}

  async execute(id: string): Promise<void> {
    const existingCompany = await this.companyRepository.findById(id);
    if (!existingCompany) {
      throw new Error(`ID가 ${id}인 회사를 찾을 수 없습니다`);
    }

    await this.companyRepository.delete(id);
  }
}
