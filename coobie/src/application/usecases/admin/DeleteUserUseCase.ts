import { UserRepository } from "@/domain/repositories/UserRepository";

export class DeleteUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(userId: string) {
    await this.userRepository.delete(userId);
  }
}