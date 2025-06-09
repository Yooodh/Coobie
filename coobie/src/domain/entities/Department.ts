export class Department {
  constructor(
    public id: number,
    public departmentName: string,
    public createdAt: Date,
    public company_id: string,
    public deletedAt?: Date
  ) {}
}
