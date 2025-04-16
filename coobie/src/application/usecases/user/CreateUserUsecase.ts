import { User } from "@/domain/entities/User";
import { UserRepository } from "@/domain/repositories/UserRepository";

export class CreateUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(
    id: string,
    username: string,
    nickname: string,
    password: string,
    departmentId?: number,
    positionId?: number,
    roleId?: string
  ): Promise<User> {
    const existingUser = await this.userRepository.findByUsername(username);
    if (existingUser) {
      throw new Error("이미 존재하는 사용자명입니다");
    }

    const newUser = new User(
      id,
      username,
      nickname,
      password,
      false, // isLocked (잠금 상태: 기본값 false)
      new Date(), // createdAt (생성일: 현재 시간)
      false, // isApproved (승인 상태: 기본값 false, 회사 관리자의 승인 필요)
      true, // notificationOn (알림 상태: 기본값 true)
      roleId || "",
      undefined, // deletedAt (삭제일: 기본값 undefined)
      departmentId,
      positionId
    );

    return await this.userRepository.save(newUser);
  }
}
