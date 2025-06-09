// src/application/usecases/company/CreateCompanyUseCase.ts
import { Company } from "@/domain/entities/Company";
import { CompanyRepository } from "@/domain/repositories/CompanyRepository";

export class CreateCompanyUseCase {
  constructor(private companyRepository: CompanyRepository) {}

  async execute(
    companyName: string,
    businessNumber: string,
    roleId: string = "01" // 기본값을 "01"로 설정 (회사 관리자)
  ): Promise<Company> {
    // 사업자번호 중복 확인
    const existingCompany = await this.companyRepository.findByBusinessNumber(
      businessNumber
    );
    if (existingCompany) {
      throw new Error("이미 등록된 사업자번호입니다");
    }

    // 새 회사 생성
    const newCompany = new Company(
      "", // ID는 저장 시 자동 생성
      companyName,
      businessNumber,
      false, // isLocked,
      new Date()
    );

    return await this.companyRepository.save(newCompany);
  }
}
