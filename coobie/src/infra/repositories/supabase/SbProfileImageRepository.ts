// src/infra/repositories/supabase/SbProfileImageRepository.ts
import { ProfileImage } from "@/domain/entities/ProfileImage";
import { ProfileImageRepository } from "@/domain/repositories/ProfileImageRepository";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";

export class SbProfileImageRepository implements ProfileImageRepository {
  private readonly BUCKET_NAME = "profile-images";
  private readonly BASE_PATH = "profiles";

  async uploadImage(userId: string, file: File): Promise<ProfileImage> {
    try {
      const supabase = createBrowserSupabaseClient();
      
      // Generate a unique file name to prevent collisions
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `${this.BASE_PATH}/${fileName}`;
      
      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });
      
      if (error) {
        throw new Error(`Failed to upload profile image: ${error.message}`);
      }
      
      // Save the reference in the profile_images table
      const { data: profileData, error: profileError } = await supabase
        .from('profile_images')
        .upsert({
          user_id: userId,
          file_name: fileName,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (profileError) {
        // If there was an error saving to the database, delete the uploaded file
        await supabase.storage.from(this.BUCKET_NAME).remove([filePath]);
        throw new Error(`Failed to save profile image reference: ${profileError.message}`);
      }
      
      return new ProfileImage(userId, fileName);
    } catch (error) {
      console.error("Error uploading profile image:", error);
      throw error;
    }
  }
  
  async getByUserId(userId: string): Promise<ProfileImage | null> {
    try {
      const supabase = createBrowserSupabaseClient();
      
      const { data, error } = await supabase
        .from('profile_images')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        // If the error is "No rows found", just return null
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new Error(`Failed to get profile image: ${error.message}`);
      }
      
      if (!data) return null;
      
      return new ProfileImage(data.user_id, data.file_name);
    } catch (error) {
      console.error("Error getting profile image:", error);
      throw error;
    }
  }
  
  async deleteImage(userId: string): Promise<void> {
    try {
      const supabase = createBrowserSupabaseClient();
      
      // First, get the current profile image to know which file to delete
      const profileImage = await this.getByUserId(userId);
      
      if (profileImage) {
        // Delete the file from storage
        const filePath = `${this.BASE_PATH}/${profileImage.fileName}`;
        const { error: storageError } = await supabase.storage
          .from(this.BUCKET_NAME)
          .remove([filePath]);
        
        if (storageError) {
          console.error(`Failed to delete image file: ${storageError.message}`);
        }
      }
      
      // Delete the reference from the database (even if file deletion fails)
      const { error: dbError } = await supabase
        .from('profile_images')
        .delete()
        .eq('user_id', userId);
      
      if (dbError) {
        throw new Error(`Failed to delete profile image reference: ${dbError.message}`);
      }
    } catch (error) {
      console.error("Error deleting profile image:", error);
      throw error;
    }
  }
  
  getImageUrl(fileName: string): string {
    try {
      const supabase = createBrowserSupabaseClient();
      
      const { data } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(`${this.BASE_PATH}/${fileName}`);
      
      return data.publicUrl;
    } catch (error) {
      console.error("Error getting profile image URL:", error);
      throw error;
    }
  }
}