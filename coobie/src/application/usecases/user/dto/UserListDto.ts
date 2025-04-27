export interface UserListDto {
  id: string;
  username: string;
  nickname: string;
  isLocked: boolean;
  isApproved: boolean;
  notificationOn: boolean;
  roleId: string;
  businessNumber: string;
  createdAt: string;
  departmentId?: number;
  positionId?: number;
  status?: 'online' | 'offline' | 'busy' | 'away';
}