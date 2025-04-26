// // src/domain/repositories/ProfileImageRepository.ts
// import { ProfileImage } from "../entities/ProfileImage";

// export interface ProfileImageRepository {
//   uploadImage(userId: string, file: File): Promise<ProfileImage>;
//   getByUserId(userId: string): Promise<ProfileImage | null>;
//   deleteImage(userId: string): Promise<void>;
//   getImageUrl(fileName: string): string;
// }

// src/domain/repositories/ProfileImageRepository.ts
import { ProfileImage } from "../entities/ProfileImage";

export interface ProfileImageRepository {
  // 기존 메서드를 수정
  save(profileImage: ProfileImage): Promise<ProfileImage>;
  update(profileImage: ProfileImage): Promise<ProfileImage>;
  findByUserId(userId: string): Promise<ProfileImage | null>;
  delete(id: string): Promise<void>;
  
  // 파일 업로드 처리 메서드 추가
  uploadImage(userId: string, file: File): Promise<{
    fileName: string;
    filePath: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
  }>;
}