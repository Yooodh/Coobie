import { User } from "@/domain/entities/User";
import { UserFilter } from "@/domain/repositories/filters/UserFilter";
import { UserRepository } from "@/domain/repositories/UserRepository";
import { createClient } from "@/utils/supabase/server";

export class SbUserRepository implements UserRepository {
	async count(filter?: UserFilter): Promise<number> {
		const supabase = await createClient();

		let query = supabase
			.from("user")
			.select("*", { count: "exact", head: true });

		if (filter) {
			if (filter.username) {
				query = query.ilike('username', `%${filter.username}%`);
			}
			if (filter.nickname) {
				query = query.ilike('nickname', `%${filter.nickname}%`);
			}
			if (filter.departmentId !== undefined) {
				query = query.eq('department_id', filter.departmentId);
			}
			if (filter.positionId !== undefined) {
				query = query.eq('position_id', filter.positionId);
			}
			if (filter.status) {
				query = query.eq('status', filter.status);
			}
			if (filter.roleId !== undefined) {
				query = query.eq('role_id', filter.roleId);
			}
			if (filter.isLocked !== undefined) {
				query = query.eq('is_locked', filter.isLocked);
			}
			if (filter.isApproved !== undefined) {
				query = query.eq('is_approved', filter.isApproved);
			}
		}

		const { count, error } = await query;

		if (error) {
			throw new Error(`Failed to count users: ${error.message}`);
		}

		return count || 0;
	}

	async findAll(filter?: UserFilter): Promise<User[]> {
		const supabase = await createClient();

		let query = supabase.from("user").select("*");

		if (filter) {
			if (filter.username) {
				query = query.ilike('username', `%${filter.username}%`);
			}
			if (filter.nickname) {
				query = query.ilike('nickname', `%${filter.nickname}%`);
			}
			if (filter.departmentId !== undefined) {
				query = query.eq('department_id', filter.departmentId);
			}
			if (filter.positionId !== undefined) {
				query = query.eq('position_id', filter.positionId);
			}
			if (filter.status) {
				query = query.eq('status', filter.status);
			}
			if (filter.roleId !== undefined) {
				query = query.eq('role_id', filter.roleId);
			}
			if (filter.isLocked !== undefined) {
				query = query.eq('is_locked', filter.isLocked);
			}
			if (filter.isApproved !== undefined) {
				query = query.eq('is_approved', filter.isApproved);
			}

			query = query.range(filter.offset, filter.offset + filter.limit - 1);
		}

		const { data, error } = await query;

		if (error) {
			throw new Error(`Failed to fetch users: ${error.message}`);
		}

		return data.map((user) => {
			return {
				id: user.ID,
				username: user.username,
				nickname: user.nickname,
				password: user.password,
				departmentId: user.department_id,
				positionId: user.position_id,
				isLocked: user.is_locked,
				isApproved: user.is_approved,
				notificationOn: user.notification_on,
				roleId: user.role_id,
				createdAt: user.created_at,
				deletedAt: user.deleted_at
			} as User;
		});
	}

	async findById(id: string): Promise<User | null> {
		const supabase = await createClient();

		const { data, error } = await supabase
			.from("user")
			.select("*")
			.eq("ID", id)
			.single();

		if (error) {
			// If no data is found, return null without throwing an error
			if (error.code === 'PGRST116') {
				return null;
			}
			throw new Error(
				`Failed to fetch user with id ${id}: ${error.message}`
			);
		}

		if (!data) {
			return null;
		}

		return {
			id: data.ID,
			username: data.username,
			nickname: data.nickname,
			password: data.password,
			departmentId: data.department_id,
			positionId: data.position_id,
			isLocked: data.is_locked,
			isApproved: data.is_approved,
			notificationOn: data.notification_on,
			roleId: data.role_id,
			createdAt: data.created_at,
			deletedAt: data.deleted_at
		} as User;
	}

	async findByUsername(username: string): Promise<User | null> {
		const supabase = await createClient();

		const { data, error } = await supabase
			.from("user")
			.select("*")
			.eq("username", username)
			.single();

		if (error) {
			// If no data is found, return null without throwing an error
			if (error.code === 'PGRST116') {
				return null;
			}
			throw new Error(
				`Failed to fetch user with username ${username}: ${error.message}`
			);
		}

		if (!data) {
			return null;
		}

		return {
			id: data.ID,
			username: data.username,
			nickname: data.nickname,
			password: data.password,
			departmentId: data.department_id,
			positionId: data.position_id,
			isLocked: data.is_locked,
			isApproved: data.is_approved,
			notificationOn: data.notification_on,
			roleId: data.role_id,
			createdAt: data.created_at,
			deletedAt: data.deleted_at
		} as User;
	}

	async findByRoleId(roleId: string, filter?: UserFilter): Promise<User[]> {
		const supabase = await createClient();

		let query = supabase
			.from("user")
			.select("*")
			.eq("role_id", roleId);

		if (filter) {
			if (filter.username) {
				query = query.ilike('username', `%${filter.username}%`);
			}
			if (filter.nickname) {
				query = query.ilike('nickname', `%${filter.nickname}%`);
			}
			if (filter.departmentId !== undefined) {
				query = query.eq('department_id', filter.departmentId);
			}
			if (filter.positionId !== undefined) {
				query = query.eq('position_id', filter.positionId);
			}
			if (filter.status) {
				query = query.eq('status', filter.status);
			}
			if (filter.isLocked !== undefined) {
				query = query.eq('is_locked', filter.isLocked);
			}
			if (filter.isApproved !== undefined) {
				query = query.eq('is_approved', filter.isApproved);
			}

			query = query.range(filter.offset, filter.offset + filter.limit - 1);
		}

		const { data, error } = await query;

		if (error) {
			throw new Error(`Failed to fetch users by role id: ${error.message}`);
		}

		return data.map((user) => {
			return {
				id: user.ID,
				username: user.username,
				nickname: user.nickname,
				password: user.password,
				departmentId: user.department_id,
				positionId: user.position_id,
				isLocked: user.is_locked,
				isApproved: user.is_approved,
				notificationOn: user.notification_on,
				roleId: user.role_id,
				createdAt: user.created_at,
				deletedAt: user.deleted_at
			} as User;
		});
	}

	async save(user: User): Promise<User> {
		const supabase = await createClient();

		const { data, error } = await supabase
			.from("user")
			.insert({
				ID: user.id,
				username: user.username,
				nickname: user.nickname,
				password: user.password,
				department_id: user.departmentId,
				position_id: user.positionId,
				is_locked: user.isLocked,
				is_approved: user.isApproved,
				notification_on: user.notificationOn,
				role_id: user.roleId
			})
			.select()
			.single();

		if (error) {
			throw new Error(`Failed to save user: ${error.message}`);
		}

		return {
			id: data.ID,
			username: data.username,
			nickname: data.nickname,
			password: data.password,
			departmentId: data.department_id,
			positionId: data.position_id,
			isLocked: data.is_locked,
			isApproved: data.is_approved,
			notificationOn: data.notification_on,
			roleId: data.role_id,
			createdAt: data.created_at,
			deletedAt: data.deleted_at
		} as User;
	}

	async update(user: User): Promise<User> {
		const supabase = await createClient();

		const updates: any = {};
		
		if (user.username !== undefined) updates.username = user.username;
		if (user.nickname !== undefined) updates.nickname = user.nickname;
		if (user.password !== undefined) updates.password = user.password;
		if (user.departmentId !== undefined) updates.department_id = user.departmentId;
		if (user.positionId !== undefined) updates.position_id = user.positionId;
		if (user.isLocked !== undefined) updates.is_locked = user.isLocked;
		if (user.isApproved !== undefined) updates.is_approved = user.isApproved;
		if (user.notificationOn !== undefined) updates.notification_on = user.notificationOn;
		if (user.roleId !== undefined) updates.role_id = user.roleId;

		const { data, error } = await supabase
			.from("user")
			.update(updates)
			.eq("ID", user.id)
			.select()
			.single();

		if (error) {
			throw new Error(
				`Failed to update user with id ${user.id}: ${error.message}`
			);
		}

		return {
			id: data.ID,
			username: data.username,
			nickname: data.nickname,
			password: data.password,
			departmentId: data.department_id,
			positionId: data.position_id,
			isLocked: data.is_locked,
			isApproved: data.is_approved,
			notificationOn: data.notification_on,
			roleId: data.role_id,
			createdAt: data.created_at,
			deletedAt: data.deleted_at
		} as User;
	}

	async delete(id: string): Promise<void> {
		const supabase = await createClient();

		// Soft delete by updating the deleted_at field
		const { error } = await supabase
			.from("user")
			.update({ deleted_at: new Date().toISOString() })
			.eq("ID", id);

		if (error) {
			throw new Error(
				`Failed to delete user with id ${id}: ${error.message}`
			);
		}
	}

	async resetPassword(id: string, defaultPassword: string): Promise<void> {
		const supabase = await createClient();

		const { error } = await supabase
			.from("user")
			.update({ 
				password: defaultPassword, 
				is_locked: false 
			})
			.eq("ID", id);

		if (error) {
			throw new Error(
				`Failed to reset password for user with id ${id}: ${error.message}`
			);
		}
	}

	async updateLoginAttempts(id: string, attempts: number): Promise<void> {
		const supabase = await createClient();

		const { error } = await supabase
			.from("user")
			.update({ login_attempts: attempts })
			.eq("ID", id);

		if (error) {
			throw new Error(
				`Failed to update login attempts for user with id ${id}: ${error.message}`
			);
		}
	}

	async updateLockStatus(id: string, isLocked: boolean): Promise<void> {
		const supabase = await createClient();

		const { error } = await supabase
			.from("user")
			.update({ is_locked: isLocked })
			.eq("ID", id);

		if (error) {
			throw new Error(
				`Failed to update lock status for user with id ${id}: ${error.message}`
			);
		}
	}

	async updateApprovalStatus(id: string, isApproved: boolean): Promise<void> {
		const supabase = await createClient();

		const { error } = await supabase
			.from("user")
			.update({ is_approved: isApproved })
			.eq("ID", id);

		if (error) {
			throw new Error(
				`Failed to update approval status for user with id ${id}: ${error.message}`
			);
		}
	}

	async updateStatus(id: string, status: 'online' | 'offline' | 'busy' | 'away'): Promise<void> {
		const supabase = await createClient();

		const { error } = await supabase
			.from("user")
			.update({ status: status })
			.eq("ID", id);

		if (error) {
			throw new Error(
				`Failed to update status for user with id ${id}: ${error.message}`
			);
		}
	}
}