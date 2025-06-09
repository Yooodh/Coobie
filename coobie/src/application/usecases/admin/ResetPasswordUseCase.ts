import { UserRepository } from "@/domain/repositories/UserRepository";

export class ResetPasswordUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(userId: string, defaultPassword: string) {
    await this.userRepository.resetPassword(userId, defaultPassword);
  }
}
