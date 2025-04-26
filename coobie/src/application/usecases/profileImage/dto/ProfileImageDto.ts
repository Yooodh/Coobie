// src/application/usecases/profileImage/dto/ProfileImageDto.ts
export interface ProfileImageDto {
  id?: string;
  userId: string;
  fileName: string;
  filePath: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface UploadProfileImageResponseDto {
  success: boolean;
  message: string;
  profileImage?: ProfileImageDto;
}
