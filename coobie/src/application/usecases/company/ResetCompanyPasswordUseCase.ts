// src/application/usecases/company/ResetCompanyPasswordUseCase.ts (수정됨)
import { CompanyRepository } from "@/domain/repositories/CompanyRepository";

export class ResetCompanyPasswordUseCase {
  constructor(private companyRepository: CompanyRepository) {}

  /**
   * 회사 관리자의 비밀번호를 초기화합니다.
   * @param companyId 회사 ID
   * @param defaultPassword 초기화할 비밀번호 (기본값: "0000")
   */
  async execute(companyId: string, defaultPassword: string = "0000"): Promise<void> {
    try {
      // 회사 존재 여부 확인
      const company = await this.companyRepository.findById(companyId);
      if (!company) {
        throw new Error(`ID가 ${companyId}인 회사를 찾을 수 없습니다`);
      }

      // 회사의 관리자 계정 비밀번호 초기화 및 잠금 해제
      await this.companyRepository.resetPassword(companyId, defaultPassword);
      
      // 회사 계정이 잠겨있는 경우 잠금 해제
      if (company.isLocked) {
        await this.companyRepository.updateLockStatus(companyId, false);
      }
    } catch (error) {
      console.error(`비밀번호 초기화 중 오류 발생 (회사 ID: ${companyId}):`, error);
      throw error; // 오류를 다시 던져서 상위 레이어에서 처리할 수 있도록 함
    }
  }
}