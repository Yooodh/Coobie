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
	updateLoginAttempts(id: string, attempts: number): Promise<void>;
	updateLockStatus(id: string, isLocked: boolean): Promise<void>;
	updateApprovalStatus(id: string, isApproved: boolean): Promise<void>;
	updateStatus(id: string, status: 'online' | 'offline' | 'busy' | 'away'): Promise<void>;
}