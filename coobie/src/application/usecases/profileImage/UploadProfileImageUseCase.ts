// src/application/usecases/profileImage/UploadProfileImageUseCase.ts
import { ProfileImage } from "@/domain/entities/ProfileImage";
import { ProfileImageRepository } from "@/domain/repositories/ProfileImageRepository";
import {
  ProfileImageDto,
  UploadProfileImageResponseDto,
} from "./dto/ProfileImageDto";

export class UploadProfileImageUseCase {
  constructor(private profileImageRepository: ProfileImageRepository) {}

  async execute(
    userId: string,
    file: File
  ): Promise<UploadProfileImageResponseDto> {
    try {
      // 파일 유효성 검사
      if (!file) {
        return {
          success: false,
          message: "이미지 파일이 제공되지 않았습니다.",
        };
      }

      // 이미지 타입 검사
      if (!ProfileImage.isValidImageType(file.type)) {
        return {
          success: false,
          message:
            "유효하지 않은 이미지 형식입니다. JPG, PNG, GIF, WEBP 형식만 허용됩니다.",
        };
      }

      // 파일 크기 검사
      if (!ProfileImage.isValidFileSize(file.size)) {
        return {
          success: false,
          message: "파일 크기는 5MB를 초과할 수 없습니다.",
        };
      }

      // 기존 프로필 이미지 확인
      const existingImage = await this.profileImageRepository.findByUserId(
        userId
      );

      // 이미지 파일 업로드
      const uploadResult = await this.profileImageRepository.uploadImage(
        userId,
        file
      );

      let profileImage: ProfileImage;

      if (existingImage) {
        // 기존 이미지가 있다면 업데이트
        profileImage = new ProfileImage(
          userId,
          uploadResult.fileName,
          uploadResult.filePath,
          uploadResult.fileUrl,
          uploadResult.fileType,
          uploadResult.fileSize,
          existingImage.createdAt,
          new Date(),
          existingImage.id
        );

        await this.profileImageRepository.update(profileImage);
      } else {
        // 새 이미지 생성
        profileImage = new ProfileImage(
          userId,
          uploadResult.fileName,
          uploadResult.filePath,
          uploadResult.fileUrl,
          uploadResult.fileType,
          uploadResult.fileSize,
          new Date()
        );

        profileImage = await this.profileImageRepository.save(profileImage);
      }

      // DTO로 변환하여 반환
      const profileImageDto: ProfileImageDto = {
        id: profileImage.id,
        userId: profileImage.userId,
        fileName: profileImage.fileName,
        filePath: profileImage.filePath,
        fileUrl: profileImage.fileUrl,
        fileType: profileImage.fileType,
        fileSize: profileImage.fileSize,
        createdAt: profileImage.createdAt.toISOString(),
        updatedAt: profileImage.updatedAt?.toISOString(),
      };

      return {
        success: true,
        message: "프로필 이미지가 성공적으로 업로드되었습니다.",
        profileImage: profileImageDto,
      };
    } catch (error) {
      console.error("프로필 이미지 업로드 중 오류 발생:", error);
      return {
        success: false,
        message: "프로필 이미지 업로드 중 오류가 발생했습니다.",
      };
    }
  }
}