// src/application/usecases/user/UpdatePasswordUseCase.ts
import { UserRepository } from "@/domain/repositories/UserRepository";

export class UpdatePasswordUseCase {
  constructor(private userRepository: UserRepository) {}

  /**
   * 사용자의 비밀번호를 변경합니다.
   * @param userId 사용자 ID
   * @param currentPassword 현재 비밀번호
   * @param newPassword 새 비밀번호
   * @returns 변경 성공 여부
   */
  async execute(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> {
    // 사용자 조회
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("사용자를 찾을 수 없습니다");
    }

    // 현재 비밀번호 검증
    if (user.password !== currentPassword) {
      throw new Error("현재 비밀번호가 일치하지 않습니다");
    }

    // 새 비밀번호가 기존 비밀번호와 동일한지 확인
    if (currentPassword === newPassword) {
      throw new Error("새 비밀번호는 현재 비밀번호와 달라야 합니다");
    }

    // 비밀번호 업데이트
    await this.userRepository.updatePassword(userId, newPassword);
    
    return true;
  }
}