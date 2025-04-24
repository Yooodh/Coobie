// src/domain/repositories/CompanyRepository.ts
import { Company } from "../entities/Company";
import { CompanyFilter } from "./filters/CompanyFilter";

export interface CompanyRepository {
  count(filter?: CompanyFilter): Promise<number>;
  findAll(filter?: CompanyFilter): Promise<Company[]>;
  findById(id: string): Promise<Company | null>;
  findByBusinessNumber(businessNumber: string): Promise<Company | null>;
  save(company: Company): Promise<Company>;
  update(company: Company): Promise<Company>;
  delete(id: string): Promise<void>;
  updateLockStatus(id: string, isLocked: boolean): Promise<void>;
  updateApprovalStatus(id: string, isApproved: boolean): Promise<void>;
  resetPassword(id: string, defaultPassword: string): Promise<void>;
}
