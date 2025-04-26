// src/infra/repositories/supabase/SbProfileImageRepository.ts
import { ProfileImage } from "@/domain/entities/ProfileImage";
import { ProfileImageRepository } from "@/domain/repositories/ProfileImageRepository";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";

export class SbProfileImageRepository implements ProfileImageRepository {
  private readonly BUCKET_NAME = "profile-images";
  private readonly PREFIX = "profiles";

  async uploadImage(userId: string, file: File): Promise<ProfileImage> {
    try {
      const supabase = createBrowserSupabaseClient();
      
      // 파일명 생성
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `${this.PREFIX}/${fileName}`;
      
      // 스토리지에 직접 업로드
      const { error: uploadError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });
      
      if (uploadError) {
        throw new Error(`Failed to upload image: ${uploadError.message}`);
      }
      
      // 파일 URL 가져오기
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);
      
      return new ProfileImage(
        userId,
        fileName,
        filePath,
        urlData.publicUrl,
        file.type,
        file.size
      );
    } catch (error) {
      console.error("Error uploading profile image:", error);
      throw error;
    }
  }

  async getByUserId(userId: string): Promise<ProfileImage | null> {
    try {
      const supabase = createBrowserSupabaseClient();
      
      // 사용자 ID로 시작하는 파일 목록 가져오기
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list(this.PREFIX);
      
      if (error) {
        throw new Error(`Failed to list profile images: ${error.message}`);
      }
      
      if (!data || data.length === 0) {
        return null;
      }
      
      // 사용자 ID로 시작하는 파일 필터링
      const userFiles = data.filter(file => file.name.startsWith(userId));
      if (userFiles.length === 0) {
        return null;
      }
      
      // 최신 파일 (타임스탬프 기준)
      const latestFile = userFiles.sort((a, b) => {
        const timestampA = parseInt(a.name.split('-')[1]?.split('.')[0] || '0');
        const timestampB = parseInt(b.name.split('-')[1]?.split('.')[0] || '0');
        return timestampB - timestampA; // 내림차순
      })[0];
      
      const filePath = `${this.PREFIX}/${latestFile.name}`;
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);
      
      return new ProfileImage(
        userId,
        latestFile.name,
        filePath,
        urlData.publicUrl,
        '', // 파일 타입 정보 없음
        0   // 파일 크기 정보 없음
      );
    } catch (error) {
      console.error("Error getting profile image:", error);
      return null; // 오류 발생 시 null 반환
    }
  }

  async deleteImage(userId: string): Promise<void> {
    try {
      const supabase = createBrowserSupabaseClient();
      
      // 사용자 ID로 시작하는 파일 목록 가져오기
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list(this.PREFIX);
      
      if (error) {
        throw new Error(`Failed to list profile images: ${error.message}`);
      }
      
      // 사용자 ID로 시작하는 모든 파일 삭제
      const filesToDelete = data
        .filter(file => file.name.startsWith(userId))
        .map(file => `${this.PREFIX}/${file.name}`);
      
      if (filesToDelete.length > 0) {
        await supabase.storage
          .from(this.BUCKET_NAME)
          .remove(filesToDelete);
      }
    } catch (error) {
      console.error("Error deleting profile image:", error);
      throw error;
    }
  }
  
  getImageUrl(fileName: string): string {
    const supabase = createBrowserSupabaseClient();
    const { data } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(`${this.PREFIX}/${fileName}`);
    return data.publicUrl;
  }
}