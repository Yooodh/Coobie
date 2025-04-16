export class UserFilter {
	constructor(
		public username?: string,
		public nickname?: string,
		public departmentId?: number,
		public positionId?: number,
		public status?: 'online' | 'offline' | 'busy' | 'away',
		public roleId?: string,
		public isLocked?: boolean,
		public isApproved?: boolean,
		public offset?: number,
		public limit?: number,  
	) {
		this.offset = offset ?? 0;
		this.limit = limit ?? 10;
	}
}