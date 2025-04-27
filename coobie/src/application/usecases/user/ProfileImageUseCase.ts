// src/application/usecases/user/ProfileImageUseCase.ts
import { ProfileImageRepository } from "@/domain/repositories/ProfileImageRepository";
import { ProfileImage } from "@/domain/entities/ProfileImage";

export class ProfileImageUseCase {
  constructor(private profileImageRepository: ProfileImageRepository) {}

  async uploadProfileImage(userId: string, file: File): Promise<ProfileImage> {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      throw new Error(
        "Unsupported file type. Please upload JPEG, PNG, GIF, or WebP images."
      );
    }

    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      throw new Error("File too large. Maximum size is 5MB.");
    }

    return await this.profileImageRepository.uploadImage(userId, file);
  }

  async getProfileImageUrl(userId: string): Promise<string | null> {
    const profileImage = await this.profileImageRepository.getByUserId(userId);

    if (!profileImage) {
      return null;
    }

    return this.profileImageRepository.getImageUrl(profileImage.fileName);
  }

  async deleteProfileImage(userId: string): Promise<void> {
    await this.profileImageRepository.deleteImage(userId);
  }
}
