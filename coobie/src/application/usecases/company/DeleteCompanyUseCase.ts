// /src/application/usecases/company/DeleteCompanyUseCase.ts
import { CompanyRepository } from "@/domain/repositories/CompanyRepository";

export class DeleteCompanyUseCase {
  constructor(private companyRepository: CompanyRepository) {}

  async execute(companyId: string): Promise<void> {
    // 회사 존재 여부 확인
    const company = await this.companyRepository.findById(companyId);
    if (!company) {
      throw new Error(`ID가 ${companyId}인 회사를 찾을 수 없습니다`);
    }

    // 회사 삭제 처리
    await this.companyRepository.delete(companyId);
  }
}