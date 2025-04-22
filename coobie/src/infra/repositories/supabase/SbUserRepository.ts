// src/infra/repositories/supabase/SbUserRepository.ts
import { User } from "@/domain/entities/User";
import { UserRepository } from "@/domain/repositories/UserRepository";
import { UserFilter } from "@/domain/repositories/filters/UserFilter";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";

export class SbUserRepository implements UserRepository {
  private supabase = createBrowserSupabaseClient();

  async findById(id: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from("user")
      .select("*")
      .eq("ID", id)
      .single();

    if (error) {
      console.error("Error finding user by ID:", error);
      return null;
    }

    if (!data) return null;

    return this.mapToUser(data);
  }

  async findByUsername(username: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from("user")
      .select("*")
      .eq("username", username)
      .single();

    if (error) {
      console.error("Error finding user by username:", error);
      return null;
    }

    if (!data) return null;

    return this.mapToUser(data);
  }

  async findAll(filter?: UserFilter): Promise<User[]> {
    let query = this.supabase
      .from("user")
      .select("*")
      .is("deleted_at", null);

    if (filter) {
      if (filter.username) {
        query = query.ilike("username", `%${filter.username}%`);
      }
      if (filter.nickname) {
        query = query.ilike("nickname", `%${filter.nickname}%`);
      }
      if (filter.departmentId) {
        query = query.eq("department_id", filter.departmentId);
      }
      if (filter.positionId) {
        query = query.eq("position_id", filter.positionId);
      }
      if (filter.status) {
        query = query.eq("status", filter.status);
      }
      if (filter.roleId) {
        query = query.eq("role_id", filter.roleId);
      }
      if (filter.isLocked !== undefined) {
        query = query.eq("is_locked", filter.isLocked);
      }
      if (filter.isApproved !== undefined) {
        query = query.eq("is_approved", filter.isApproved);
      }
      
      const offset = filter.offset ?? 0;
      const limit = filter.limit ?? 10;
      query = query.range(offset, offset + limit - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`사용자 목록을 가져오는 중 오류 발생: ${error.message}`);
    }

    return (data || []).map(user => this.mapToUser(user));
  }

  async findByRoleId(roleId: string, filter?: UserFilter): Promise<User[]> {
    let query = this.supabase
      .from("user")
      .select("*")
      .eq("role_id", roleId)
      .is("deleted_at", null);

    if (filter) {
      // Apply other filters
      if (filter.username) {
        query = query.ilike("username", `%${filter.username}%`);
      }
      if (filter.isLocked !== undefined) {
        query = query.eq("is_locked", filter.isLocked);
      }
      if (filter.isApproved !== undefined) {
        query = query.eq("is_approved", filter.isApproved);
      }
      
      const offset = filter.offset ?? 0;
      const limit = filter.limit ?? 10;
      query = query.range(offset, offset + limit - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`역할별 사용자 목록을 가져오는 중 오류 발생: ${error.message}`);
    }

    return (data || []).map(user => this.mapToUser(user));
  }

  async save(user: User): Promise<User> {
    const userData = {
      username: user.username,
      nickname: user.nickname,
      password: user.password,
      is_locked: user.isLocked,
      created_at: user.createdAt.toISOString(),
      is_approved: user.isApproved,
      notification_on: user.notificationOn,
      role_id: user.roleId,
      business_number: user.businessNumber,
      department_id: user.departmentId,
      position_id: user.positionId,
    };

    const { data, error } = await this.supabase
      .from("user")
      .insert(userData)
      .select()
      .single();

    if (error) {
      throw new Error(`사용자 저장 중 오류 발생: ${error.message}`);
    }

    return this.mapToUser(data);
  }

  async update(user: User): Promise<User> {
    const updateData = {
      username: user.username,
      nickname: user.nickname,
      password: user.password,
      is_locked: user.isLocked,
      is_approved: user.isApproved,
      notification_on: user.notificationOn,
      department_id: user.departmentId,
      position_id: user.positionId,
    };

    const { data, error } = await this.supabase
      .from("user")
      .update(updateData)
      .eq("ID", user.id)
      .select()
      .single();

    if (error) {
      throw new Error(`사용자 업데이트 중 오류 발생: ${error.message}`);
    }

    return this.mapToUser(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("user")
      .update({ deleted_at: new Date().toISOString() })
      .eq("ID", id);

    if (error) {
      throw new Error(`사용자 삭제 중 오류 발생: ${error.message}`);
    }
  }

  async count(filter?: UserFilter): Promise<number> {
    let query = this.supabase
      .from("user")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null);

    if (filter) {
      if (filter.username) {
        query = query.ilike("username", `%${filter.username}%`);
      }
      if (filter.roleId) {
        query = query.eq("role_id", filter.roleId);
      }
      if (filter.isLocked !== undefined) {
        query = query.eq("is_locked", filter.isLocked);
      }
      if (filter.isApproved !== undefined) {
        query = query.eq("is_approved", filter.isApproved);
      }
    }

    const { count, error } = await query;

    if (error) {
      throw new Error(`사용자 수를 가져오는 중 오류 발생: ${error.message}`);
    }

    return count || 0;
  }

  async resetPassword(id: string, defaultPassword: string): Promise<void> {
    const { error } = await this.supabase
      .from("user")
      .update({ 
        password: defaultPassword,
        is_locked: false,
        login_attempts: 0
      })
      .eq("ID", id);

    if (error) {
      throw new Error(`비밀번호 재설정 중 오류 발생: ${error.message}`);
    }
  }

  async updateLockStatus(id: string, isLocked: boolean): Promise<void> {
    const { error } = await this.supabase
      .from("user")
      .update({ is_locked: isLocked })
      .eq("ID", id);

    if (error) {
      throw new Error(`잠금 상태 업데이트 중 오류 발생: ${error.message}`);
    }
  }

  async incrementLoginAttempts(id: string): Promise<number> {
    const { data: user, error: getUserError } = await this.supabase
      .from("user")
      .select("login_attempts")
      .eq("ID", id)
      .single();

    if (getUserError) {
      throw new Error(`사용자 조회 중 오류 발생: ${getUserError.message}`);
    }

    const newAttempts = (user?.login_attempts || 0) + 1;

    const { error: updateError } = await this.supabase
      .from("user")
      .update({ login_attempts: newAttempts })
      .eq("ID", id);

    if (updateError) {
      throw new Error(`로그인 시도 횟수 업데이트 중 오류 발생: ${updateError.message}`);
    }

    return newAttempts;
  }

  async resetLoginAttempts(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("user")
      .update({ login_attempts: 0 })
      .eq("ID", id);

    if (error) {
      throw new Error(`로그인 시도 횟수 초기화 중 오류 발생: ${error.message}`);
    }
  }

  async updateApprovalStatus(id: string, isApproved: boolean): Promise<void> {
    const { error } = await this.supabase
      .from("user")
      .update({ is_approved: isApproved })
      .eq("ID", id);

    if (error) {
      throw new Error(`승인 상태 업데이트 중 오류 발생: ${error.message}`);
    }
  }

  async updateStatus(id: string, status: "online" | "offline" | "busy" | "away"): Promise<void> {
    const { error } = await this.supabase
      .from("user")
      .update({ status })
      .eq("ID", id);

    if (error) {
      throw new Error(`상태 업데이트 중 오류 발생: ${error.message}`);
    }
  }

  // 데이터 매핑 유틸리티 메서드
  private mapToUser(data: any): User {
    return new User(
      data.ID,
      data.username,
      data.nickname,
      data.password,
      data.is_locked,
      new Date(data.created_at),
      data.is_approved,
      data.notification_on,
      data.role_id,
      data.business_number,
      data.deleted_at ? new Date(data.deleted_at) : undefined,
      data.department_id,
      data.position_id
    );
  }
}