// src/application/usecases/user/dto/UserDto.ts
export interface UserDto {
  id: string;
  username: string;
  nickname: string;
  isLocked: boolean;
  isApproved: boolean;
  notificationOn: boolean;
  roleId: string;
  createdAt: string;
  businessNumber?: string;
  departmentId?: number;
  positionId?: number;
  departmentName?: string;
  positionName?: string;
  status?: 'online' | 'offline' | 'busy' | 'away';
  profileMessage?: string;
}