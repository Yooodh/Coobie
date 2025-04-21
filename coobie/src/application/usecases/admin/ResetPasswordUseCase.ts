import { UserRepository } from "@/domain/repositories/UserRepository";
import { useId } from "react";

export class ResetPasswordUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(userId: string, defaultPassword: string) {
    await this.userRepository.resetPassword(userId, defaultPassword);
  }
}
