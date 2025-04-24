// src/application/usecases/auth/RegisterCompanyUseCase.ts
import { Company } from "@/domain/entities/Company";
import { User } from "@/domain/entities/User";
import { CompanyRepository } from "@/domain/repositories/CompanyRepository";
import { UserRepository } from "@/domain/repositories/UserRepository";

export class RegisterCompanyUseCase {
  constructor(
    private companyRepository: CompanyRepository,
    private userRepository: UserRepository
  ) {}

  async execute(
    companyName: string,
    businessNumber: string,
    username: string,
    nickname: string,
    password: string
  ): Promise<{ company: Company; adminUser: User }> {
    // 사업자번호 중복 확인
    const existingCompany = await this.companyRepository.findByBusinessNumber(
      businessNumber
    );
    if (existingCompany) {
      throw new Error("이미 등록된 사업자번호입니다");
    }

    // 사용자명 중복 확인
    const existingUser = await this.userRepository.findByUsername(username);
    if (existingUser) {
      throw new Error("이미 사용 중인 사용자명입니다");
    }

    // 관리자 사용자 생성
    const adminUser = new User(
      "", // ID는 저장 시 자동 생성
      username,
      nickname,
      password,
      false, // isLocked
      new Date(), // createdAt
      false, // isApproved - 루트 관리자 승인 대기
      true, // notificationOn
      "01", // roleId - 회사 관리자
      businessNumber,
      undefined, // deletedAt
      undefined, // departmentId
      undefined // positionId
    );

    const savedAdmin = await this.userRepository.save(adminUser);

    // 회사 생성
    const company = new Company(
      "", // ID는 저장 시 자동 생성
      companyName,
      false, // isLocked
      savedAdmin.id, // userId (관리자 연결)
      "01", // roleId - 회사 관리자
      undefined // deletedAt
    );

    const savedCompany = await this.companyRepository.save(company);

    return { company: savedCompany, adminUser: savedAdmin };
  }
}