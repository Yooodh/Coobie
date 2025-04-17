import { User } from "@/domain/entities/User";
import { UserRepository } from "@/domain/repositories/UserRepository";
import { UserFilter } from "@/domain/repositories/filters/UserFilter";

export class GetUserUsecase {
  constructor(private userRepository: UserRepository) {}

  async getById(id: string): Promise<User | null> {
    return await this.userRepository.findById(id);
  }

  async getByUsername(username: string): Promise<User | null> {
    return await this.userRepository.findByUsername(username);
  }

  async getAll(
    filter?: UserFilter
  ): Promise<{ users: User[]; total: number; totalPages: number }> {
    const users = await this.userRepository.findAll(filter);

    const total = await this.userRepository.count(filter);

    const limit = filter?.limit || 10;

    const totalPages = Math.ceil(total / limit);

    return {
      users,
      total,
      totalPages,
    };
  }

  async getByRoleId(
    roleId: string,
    filter?: UserFilter
  ): Promise<{ users: User[]; total: number; totalPages: number }> {
    const users = await this.userRepository.findByRoleId(roleId, filter);

    const total = await this.userRepository.count({ ...filter, roleId });

    const limit = filter?.limit || 10;

    const totalPages = Math.ceil(total / limit);

    return { users, total, totalPages };
  }
}
