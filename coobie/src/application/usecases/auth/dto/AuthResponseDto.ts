import { AuthUserDto } from "./AuthUserDto";

export interface AuthResponseDto {
  user: AuthUserDto;
  redirectUrl: string;
}
