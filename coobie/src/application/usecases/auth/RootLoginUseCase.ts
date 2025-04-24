// /application/usecases/auth/RootLoginUseCase.ts
import { User } from "@/domain/entities/User";
import { UserRepository } from "@/domain/repositories/UserRepository";
import { sign } from "jsonwebtoken";

export class RootLoginUseCase {
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

    // 루트 관리자 역할(roleId = "00") 확인
    if (user.roleId !== "00") {
      throw new Error("NOT_ROOT_ADMIN");
    }

    // 비밀번호 확인 (실제로는 암호화 비교가 필요)
    if (user.password !== password) {
      // 로그인 실패 횟수 증가 (5회 실패 시 계정 잠금)
      const loginAttempts = await this.userRepository.incrementLoginAttempts(user.id);
      
      if (loginAttempts >= 5) {
        await this.userRepository.updateLockStatus(user.id, true);
        throw new Error("ACCOUNT_LOCKED");
      }
      
      throw new Error("INVALID_PASSWORD");
    }

    // 로그인 성공 시 로그인 실패 횟수 초기화
    await this.userRepository.resetLoginAttempts(user.id);

    // 토큰 생성
    const jwtSecret = process.env.JWT_SECRET || "default-jwt-secret";
    const token = sign(
      {
        userId: user.id,
        username: user.username,
        roleId: user.roleId,
        businessNumber: user.businessNumber
      },
      jwtSecret,
      { expiresIn: "7d" }
    );

    return { user, token };
  }
}