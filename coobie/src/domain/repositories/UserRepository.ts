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
}
