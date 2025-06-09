// /src/application/usecases/company/RejectCompanyUseCase.ts
import { CompanyRepository } from "@/domain/repositories/CompanyRepository";

export class RejectCompanyUseCase {
  constructor(private companyRepository: CompanyRepository) {}

  async execute(companyId: string): Promise<void> {
    // 회사 존재 여부 확인
    const company = await this.companyRepository.findById(companyId);
    if (!company) {
      throw new Error(`ID가 ${companyId}인 회사를 찾을 수 없습니다`);
    }

    // 회사 승인 상태를 거부로 설정하거나 삭제처리
    // 여기서는 거절된 회사를 삭제하는 방식으로 구현
    await this.companyRepository.delete(companyId);
  }
}
