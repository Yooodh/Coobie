import { User } from "@/domain/entities/User";
import { UserRepository } from "@/domain/repositories/UserRepository";
import { UserFilter } from "@/domain/repositories/filters/UserFilter";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";

export class SbUserRepository implements UserRepository {
  findById(id: string): Promise<User | null> {
    throw new Error("Method not implemented.");
  }
  findByUsername(username: string): Promise<User | null> {
    throw new Error("Method not implemented.");
  }
  findByRoleId(roleId: string, filter?: UserFilter): Promise<User[]> {
    throw new Error("Method not implemented.");
  }
  save(user: User): Promise<User> {
    throw new Error("Method not implemented.");
  }
  update(user: User): Promise<User> {
    throw new Error("Method not implemented.");
  }
  delete(id: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  resetPassword(id: string, defaultPassword: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  updateLockStatus(id: string, isLocked: boolean): Promise<void> {
    throw new Error("Method not implemented.");
  }
  incrementLoginAttempts(id: string): Promise<number> {
    throw new Error("Method not implemented.");
  }
  resetLoginAttempts(id: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  updateApprovalStatus(id: string, isApproved: boolean): Promise<void> {
    throw new Error("Method not implemented.");
  }
  updateStatus(id: string, status: "online" | "offline" | "busy" | "away"): Promise<void> {
    throw new Error("Method not implemented.");
  }
  private supabase = createBrowserSupabaseClient();

  async findAll(filter: UserFilter) {
    let query = this.supabase.from("users").select("*");

    if (filter.username) {
      query = query.ilike("username", `%${filter.username}%`);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`사용자 목록을 가져오는 중 오류 발생: ${error.message}`);
    }

    return data || [];
  }

  async count(filter: UserFilter) {
    let query = this.supabase.from("users").select("*", { count: "exact", head: true });

    if (filter.username) {
      query = query.ilike("username", `%${filter.username}%`);
    }

    const { count, error } = await query;

    if (error) {
      throw new Error(`사용자 수를 가져오는 중 오류 발생: ${error.message}`);
    }

    return count || 0;
  }
}