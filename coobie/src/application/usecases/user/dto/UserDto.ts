// src/application/usecases/user/dto/UserDto.ts
export interface UserDto {
  id: string;
  username: string;
  nickname: string;
  businessNumber?: string;

  departmentId?: number;
  positionId?: number;
  departmentName?: string;
  positionName?: string;
  status?: "online" | "offline" | "busy" | "away";
  profileMessage?: string;
  profileImageUrl?: string;
}
