// /src/application/usecases/company/dto/CompanyDto.ts
export interface CompanyDto {
  id: string;
  companyName: string;
  businessNumber: string;
  isLocked: boolean;
  isApproved: boolean;
  createdAt: string;
}