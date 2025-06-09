// src/application/usecases/auth/AuthenticateUserUseCase.ts
import { User } from "@/domain/entities/User";
import { UserRepository } from "@/domain/repositories/UserRepository";
import { sign } from "jsonwebtoken";

export class AuthenticateUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(
    username: string,
    password: string
  ): Promise<{ user: User; token: string }> {
    // 사용자 조회
    const user = await this.userRepository.findByUsername(username);
    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    // 계정 잠금 확인
    if (user.isLocked) {
      throw new Error("ACCOUNT_LOCKED");
    }

    // 계정 승인 확인
    if (!user.isApproved) {
      throw new Error("ACCOUNT_NOT_APPROVED");
    }

    // 비밀번호 확인 (실제로는 암호화 비교가 필요)
    if (user.password !== password) {
      throw new Error("INVALID_PASSWORD");
    }

    // 토큰 생성
    const jwtSecret = process.env.JWT_SECRET || "default-jwt-secret";
    const token = sign(
      {
        userId: user.id,
        username: user.username,
        roleId: user.roleId,
        businessNumber: user.businessNumber,
      },
      jwtSecret,
      { expiresIn: "7d" }
    );

    return { user, token };
  }
}
