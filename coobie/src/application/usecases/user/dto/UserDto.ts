// // src/application/usecases/user/dto/UserDto.ts
// export interface UserDto {
//   id: string;
//   username: string;
//   nickname: string;
//   departmentId?: number;
//   positionId?: number;
//   departmentName?: string;
//   positionName?: string;
//   // 추후 확장성을 위해 optional로 추가
//   status?: "online" | "offline" | "busy" | "away";
// }

// src/application/usecases/user/dto/UserDto.ts
export interface UserDto {
  id: string;
  username: string;
  nickname: string;
  departmentId?: number;
  positionId?: number;
  departmentName?: string;
  positionName?: string;
  status?: "online" | "offline" | "busy" | "away";
  profileMessage?: string;
  profileImageUrl?: string;
}
