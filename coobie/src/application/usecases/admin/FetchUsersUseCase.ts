import { UserRepository } from "@/domain/repositories/UserRepository";
import { UserFilter } from "@/domain/repositories/filters/UserFilter";

export class FetchUsersUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(filters: UserFilter, currentPage: number, limit: number = 10) {
    const offset = (currentPage - 1) * limit;

    filters.offset = offset;
    filters.limit = limit;

    const users = await this.userRepository.findAll(filters);
    const total = await this.userRepository.count(filters);

    const totalPages = Math.ceil(total / limit);

    return { users, total, totalPages };
  }
}