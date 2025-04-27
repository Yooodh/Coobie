export interface AuthUserDto {
  id: string;
  username: string;
  nickname: string;
  roleId: string;
  businessNumber?: string;
  status?: "online" | "offline" | "busy" | "away";
  departmentId?: number;
  positionId?: number;
  departmentName?: string;
  positionName?: string;
}
