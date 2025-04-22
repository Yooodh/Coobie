import { User } from "@/domain/entities/User";
import { UserRepository } from "@/domain/repositories/UserRepository";

export class CreateUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(
    id: string | undefined, // ID를 선택적 파라미터로 변경
    username: string,
    nickname: string,
    password: string,
    departmentId?: number,
    positionId?: number,
    roleId: string = "02", // 기본값을 "02"로 설정
    businessNumber: string="" // 사업자 번호 추가
  ): Promise<User> {
    const existingUser = await this.userRepository.findByUsername(username);
    if (existingUser) {
      throw new Error("이미 존재하는 사용자명입니다");
    }

    // 사업자 번호가 비어있으면 에러 발생
    if (!businessNumber) {
      throw new Error("사업자 번호는 필수 입력 항목입니다")
    }

    const newUser = new User(
      id || "", // ID가 제공되지 않은 경우 빈 문자열로 설정 (Supabase에서 자동 생성)
      username,
      nickname,
      password,
      false, // isLocked (잠금 상태: 기본값 false)
      new Date(), // createdAt (생성일: 현재 시간)
      false, // isApproved (승인 상태: 기본값 false, 회사 관리자의 승인 필요)
      true, // notificationOn (알림 상태: 기본값 true)
      roleId, // 역할 ID (기본값 "02")
      businessNumber, // 사업자 번호 설정
      undefined, // deletedAt (삭제일: 기본값 undefined)
      departmentId,
      positionId
    );

    return await this.userRepository.save(newUser);
  }
}
