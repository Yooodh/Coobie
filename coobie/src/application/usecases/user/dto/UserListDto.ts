import { UserDto } from './UserDto';

export interface UserListDto {
  users: UserDto[];
  total: number;
  totalPages: number;
}