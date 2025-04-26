// src/domain/repositories/ProfileImageRepository.ts
import { ProfileImage } from "../entities/ProfileImage";

export interface ProfileImageRepository {
  uploadImage(userId: string, file: File): Promise<ProfileImage>;

  getByUserId(userId: string): Promise<ProfileImage | null>;

  deleteImage(userId: string): Promise<void>;

  getImageUrl(fileName: string): string;
}
