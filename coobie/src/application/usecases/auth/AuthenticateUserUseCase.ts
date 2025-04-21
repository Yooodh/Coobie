// src/application/usecases/auth/AuthenticateUserUseCase.ts 수정
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

    // 토큰 생성 (businessNumber 추가)
    const jwtSecret = process.env.JWT_SECRET || "default-jwt-secret";
    const token = sign(
      {
        userId: user.id,
        username: user.username,
        roleId: user.roleId,
        businessNumber: user.businessNumber // 비즈니스 번호 추가
      },
      jwtSecret,
      { expiresIn: "7d" }
    );    

    console.log("생성된 토큰 정보:", {
      userId: user.id,
      username: user.username,
      roleId: user.roleId,
      businessNumber: user.businessNumber
    });

    return { user, token };
  }
}