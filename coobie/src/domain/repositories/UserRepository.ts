import { User } from "../entities/User";
import { UserFilter } from "./filters/UserFilter";

export interface UserRepository {
  count(filter?: UserFilter): Promise<number>;
  findAll(filter?: UserFilter): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findByRoleId(roleId: string, filter?: UserFilter): Promise<User[]>;
  save(user: User): Promise<User>;
  update(user: User): Promise<User>;
  delete(id: string): Promise<void>;
  resetPassword(id: string, defaultPassword: string): Promise<void>;
  updateLockStatus(id: string, isLocked: boolean): Promise<void>;
  updatePassword(id: string, newPassword: string): Promise<void>;

  // 로그인 관련
  incrementLoginAttempts(id: string): Promise<number>;
  resetLoginAttempts(id: string): Promise<void>;
  updateApprovalStatus(id: string, isApproved: boolean): Promise<void>;
  updateStatus(
    id: string,
    status: "online" | "offline" | "busy" | "away"
  ): Promise<void>;
}
