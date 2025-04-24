export class User {
  constructor(
    public id: string,
    public username: string,
    public nickname: string,
    public password: string,
    public isLocked: boolean = false,
    public createdAt: Date,
    public isApproved: boolean = false,
    public notificationOn: boolean = true,
    public roleId: string,
    public businessNumber: string,
    public deletedAt?: Date,
    public departmentId?: number,
    public positionId?: number
  ) {}
}
