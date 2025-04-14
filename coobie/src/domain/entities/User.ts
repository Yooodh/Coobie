export class User {
  constructor(
    username: string,
    password: string,
    createdAt: Date,
    isLocked: boolean,
    isApproved: boolean,
    nickName: string,
    notificationOn: boolean,
    departmentId: number,
    positionId: number,
    roleId: string,
    deleted_at: Date
  ) {}
}
