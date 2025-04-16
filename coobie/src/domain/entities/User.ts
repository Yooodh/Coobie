export class User {
	constructor(
		public id?: string,
		public username?: string,
		public nickname?: string,
		public password?: string,
		public departmentId?: number,
		public positionId?: number,
		public loginAttempts: number = 0,
		public isLocked: boolean = false,
		public isApproved: boolean = false,
		public status: 'online' | 'offline' | 'busy' | 'away' = 'offline',
		public profileMessage?: string,
		public profileImageId?: number,
		public notificationOn: boolean = true,
		public roleId?: string,
		public createdAt?: Date,
		public deletedAt?: Date
	) {}
}