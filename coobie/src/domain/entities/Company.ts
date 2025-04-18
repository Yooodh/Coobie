export class Company {
  constructor(
    public Id: string,
    public companyName: string,
    public businessNumber: string,
    public isLocked: boolean,
    public deletedAt: Date
  ) {}
}
