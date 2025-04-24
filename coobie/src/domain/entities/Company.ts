export class Company {
  constructor(
    public id: string,
    public companyName: string,
    public isLocked: boolean = false,
    public userId: string,     // 관리자 사용자 ID 참조
    public roleId: string,     // 역할 ID
    public deletedAt?: Date
  ) {}
}