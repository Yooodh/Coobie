export class Position {
  constructor(
    public id: number,
    public positionName: string,
    public createdAt: Date,
    public company_id: string, 
    public deletedAt?: Date,
  ) {}
}
