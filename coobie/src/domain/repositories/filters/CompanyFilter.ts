// src/domain/repositories/filters/CompanyFilter.ts
export class CompanyFilter {
  constructor(
    public companyName?: string,
    public businessNumber?: string,
    public isLocked?: boolean,
    public isApproved?: boolean,
    public offset?: number,
    public limit?: number
  ) {
    this.offset = offset ?? 0;
    this.limit = limit ?? 10;
  }
}
