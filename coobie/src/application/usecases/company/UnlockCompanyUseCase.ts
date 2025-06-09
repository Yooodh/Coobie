// /src/application/usecases/company/UnlockCompanyUseCase.ts
import { CompanyRepository } from "@/domain/repositories/CompanyRepository";

export class UnlockCompanyUseCase {
  constructor(private companyRepository: CompanyRepository) {}

  async execute(companyId: string): Promise<void> {
    // 회사 존재 여부 확인
    const company = await this.companyRepository.findById(companyId);
    if (!company) {
      throw new Error(`ID가 ${companyId}인 회사를 찾을 수 없습니다`);
    }

    // 회사가 잠겨있는지 확인
    if (!company.isLocked) {
      throw new Error(`ID가 ${companyId}인 회사는 잠겨있지 않습니다`);
    }

    // 회사 잠금 상태 해제 및 비밀번호 초기화
    await this.companyRepository.updateLockStatus(companyId, false);
    await this.companyRepository.resetPassword(companyId, "0000");
  }
}