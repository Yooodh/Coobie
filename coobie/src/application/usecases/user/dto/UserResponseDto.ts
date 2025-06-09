import { User } from "@/domain/entities/User";

export interface UserResponseDto {
  users: User[];
  total: number;
  totalPages: number;
}
