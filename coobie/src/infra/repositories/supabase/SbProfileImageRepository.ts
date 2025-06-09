// src/infra/repositories/supabase/SbProfileImageRepository.ts
import { ProfileImage } from "@/domain/entities/ProfileImage";
import { ProfileImageRepository } from "@/domain/repositories/ProfileImageRepository";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";

export class SbProfileImageRepository implements ProfileImageRepository {
  private readonly BUCKET_NAME = "profile-images";
  private readonly PREFIX = "profiles";

  async save(profileImage: ProfileImage): Promise<ProfileImage> {
    try {
      const supabase = createBrowserSupabaseClient();
      
      // 프로필 이미지 정보를 데이터베이스에 저장
      const { data, error } = await supabase
        .from("profileimage")
        .insert({
          user_id: profileImage.userId,
          file_name: profileImage.fileName,
          file_path: profileImage.filePath,
          file_url: profileImage.fileUrl,
          file_type: profileImage.fileType,
          file_size: profileImage.fileSize,
          created_at: profileImage.createdAt.toISOString(),
        })
        .select()
        .single();
      
      if (error) {
        throw new Error(`프로필 이미지 저장 중 오류 발생: ${error.message}`);
      }
      
      // 저장된 데이터로 ProfileImage 객체 생성하여 반환
      return new ProfileImage(
        data.user_id,
        data.file_name,
        data.file_path,
        data.file_url,
        data.file_type,
        data.file_size,
        new Date(data.created_at),
        data.updated_at ? new Date(data.updated_at) : undefined,
        data.id
      );
    } catch (error) {
      console.error("프로필 이미지 저장 중 오류:", error);
      throw error;
    }
  }

  async update(profileImage: ProfileImage): Promise<ProfileImage> {
    try {
      const supabase = createBrowserSupabaseClient();
      
      const { data, error } = await supabase
        .from("profileimage")
        .update({
          file_name: profileImage.fileName,
          file_path: profileImage.filePath,
          file_url: profileImage.fileUrl,
          file_type: profileImage.fileType,
          file_size: profileImage.fileSize,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profileImage.id)
        .select()
        .single();
      
      if (error) {
        throw new Error(`프로필 이미지 업데이트 중 오류 발생: ${error.message}`);
      }
      
      return new ProfileImage(
        data.user_id,
        data.file_name,
        data.file_path,
        data.file_url,
        data.file_type,
        data.file_size,
        new Date(data.created_at),
        new Date(data.updated_at),
        data.id
      );
    } catch (error) {
      console.error("프로필 이미지 업데이트 중 오류:", error);
      throw error;
    }
  }

  async findByUserId(userId: string): Promise<ProfileImage | null> {
    try {
      const supabase = createBrowserSupabaseClient();
      
      // 데이터베이스에서 사용자 ID로 프로필 이미지 조회
      const { data, error } = await supabase
        .from("profileimage")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) {
        throw new Error(`프로필 이미지 조회 중 오류 발생: ${error.message}`);
      }
      
      if (!data) {
        return null;
      }
      
      return new ProfileImage(
        data.user_id,
        data.file_name,
        data.file_path,
        data.file_url,
        data.file_type,
        data.file_size,
        new Date(data.created_at),
        data.updated_at ? new Date(data.updated_at) : undefined,
        data.id
      );
    } catch (error) {
      console.error("프로필 이미지 조회 중 오류:", error);
      return null;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const supabase = createBrowserSupabaseClient();
      
      // 이미지 정보 조회
      const { data: imageData, error: fetchError } = await supabase
        .from("profileimage")
        .select("file_path")
        .eq("id", id)
        .single();
      
      if (fetchError) {
        throw new Error(`프로필 이미지 정보 조회 중 오류 발생: ${fetchError.message}`);
      }
      
      if (imageData && imageData.file_path) {
        // 스토리지에서 파일 삭제
        const { error: storageError } = await supabase
          .storage
          .from(this.BUCKET_NAME)
          .remove([imageData.file_path]);
        
        if (storageError) {
          console.error("스토리지에서 이미지 삭제 중 오류:", storageError);
        }
      }
      
      // 데이터베이스에서 레코드 삭제
      const { error: deleteError } = await supabase
        .from("profileimage")
        .delete()
        .eq("id", id);
      
      if (deleteError) {
        throw new Error(`프로필 이미지 삭제 중 오류 발생: ${deleteError.message}`);
      }
    } catch (error) {
      console.error("프로필 이미지 삭제 중 오류:", error);
      throw error;
    }
  }

  async uploadImage(userId: string, file: File): Promise<{
    fileName: string;
    filePath: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
  }> {
    try {
      const supabase = createBrowserSupabaseClient();
      
      // 파일명 생성
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `${this.PREFIX}/${fileName}`;
      
      // 스토리지에 파일 업로드
      const { error: uploadError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });
      
      if (uploadError) {
        throw new Error(`이미지 업로드 중 오류 발생: ${uploadError.message}`);
      }
      
      // 파일 URL 가져오기
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);
      
      return {
        fileName,
        filePath,
        fileUrl: urlData.publicUrl,
        fileType: file.type,
        fileSize: file.size,
      };
    } catch (error) {
      console.error("이미지 업로드 중 오류:", error);
      throw error;
    }
  }
}