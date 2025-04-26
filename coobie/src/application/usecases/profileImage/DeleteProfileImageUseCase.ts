// src/application/usecases/profileImage/DeleteProfileImageUseCase.ts
import { ProfileImageRepository } from "@/domain/repositories/ProfileImageRepository";

export class DeleteProfileImageUseCase {
  constructor(private profileImageRepository: ProfileImageRepository) {}

  async execute(
    userId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // 사용자의 프로필 이미지 조회
      const existingImage = await this.profileImageRepository.findByUserId(
        userId
      );

      if (!existingImage) {
        return {
          success: false,
          message: "삭제할 프로필 이미지가 존재하지 않습니다.",
        };
      }

      // 프로필 이미지 삭제
      await this.profileImageRepository.delete(existingImage.id);

      return {
        success: true,
        message: "프로필 이미지가 성공적으로 삭제되었습니다.",
      };
    } catch (error) {
      console.error("프로필 이미지 삭제 중 오류 발생:", error);
      return {
        success: false,
        message: "프로필 이미지 삭제 중 오류가 발생했습니다.",
      };
    }
  }
}
