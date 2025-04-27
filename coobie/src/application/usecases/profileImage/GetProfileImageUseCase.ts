// src/application/usecases/profileImage/GetProfileImageUseCase.ts
import { ProfileImageRepository } from "@/domain/repositories/ProfileImageRepository";
import { ProfileImageDto } from "./dto/ProfileImageDto";

export class GetProfileImageUseCase {
  constructor(private profileImageRepository: ProfileImageRepository) {}

  async execute(userId: string): Promise<ProfileImageDto | null> {
    try {
      const profileImage = await this.profileImageRepository.findByUserId(userId);
      
      if (!profileImage) {
        return null;
      }
      
      return {
        id: profileImage.id,
        userId: profileImage.userId,
        fileName: profileImage.fileName,
        filePath: profileImage.filePath,
        fileUrl: profileImage.fileUrl,
        fileType: profileImage.fileType,
        fileSize: profileImage.fileSize,
        createdAt: profileImage.createdAt.toISOString(),
        updatedAt: profileImage.updatedAt?.toISOString()
      };
    } catch (error) {
      console.error("프로필 이미지 조회 중 오류 발생:", error);
      throw new Error("프로필 이미지를 조회하는 중 오류가 발생했습니다.");
    }
  }
}