// src/application/usecases/company/GetCompanyUseCase.ts
import { Company } from "@/domain/entities/Company";
import { CompanyRepository } from "@/domain/repositories/CompanyRepository";
import { CompanyFilter } from "@/domain/repositories/filters/CompanyFilter";

export class GetCompanyUseCase {
  constructor(private companyRepository: CompanyRepository) {}

  async getById(id: string): Promise<Company | null> {
    return await this.companyRepository.findById(id);
  }

  async getByBusinessNumber(businessNumber: string): Promise<Company | null> {
    return await this.companyRepository.findByBusinessNumber(businessNumber);
  }

  async getAll(
    filter?: CompanyFilter
  ): Promise<{ companies: Company[]; total: number; totalPages: number }> {
    const companies = await this.companyRepository.findAll(filter);
    const total = await this.companyRepository.count(filter);
    const limit = filter?.limit || 10;
    const totalPages = Math.ceil(total / limit);

    return {
      companies,
      total,
      totalPages,
    };
  }
}
