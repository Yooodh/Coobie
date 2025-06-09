// src/application/usecases/company/UpdateCompanyUseCase.ts
import { Company } from "@/domain/entities/Company";
import { CompanyRepository } from "@/domain/repositories/CompanyRepository";

export class UpdateCompanyUseCase {
  constructor(private companyRepository: CompanyRepository) {}

  async execute(company: Partial<Company> & { id: string }): Promise<Company> {
    const existingCompany = await this.companyRepository.findById(company.id);
    if (!existingCompany) {
      throw new Error(`ID가 ${company.id}인 회사를 찾을 수 없습니다`);
    }

    // 사업자번호가 변경되었는지 확인
    if (
      company.businessNumber &&
      company.businessNumber !== existingCompany.businessNumber
    ) {
      const companyWithSameBusinessNumber =
        await this.companyRepository.findByBusinessNumber(
          company.businessNumber
        );
      if (
        companyWithSameBusinessNumber &&
        companyWithSameBusinessNumber.id !== company.id
      ) {
        throw new Error("이미 등록된 사업자번호입니다");
      }
    }

    // 회사 정보 업데이트
    const updatedCompany = {
      ...existingCompany,
      ...company,
    };

    return await this.companyRepository.update(updatedCompany);
  }

  async updateLockStatus(id: string, isLocked: boolean): Promise<void> {
    await this.companyRepository.updateLockStatus(id, isLocked);
  }

  async updateApprovalStatus(id: string, isApproved: boolean): Promise<void> {
    await this.companyRepository.updateApprovalStatus(id, isApproved);
  }

  async resetPassword(
    id: string,
    defaultPassword: string = "0000"
  ): Promise<void> {
    await this.companyRepository.resetPassword(id, defaultPassword);
  }
}
