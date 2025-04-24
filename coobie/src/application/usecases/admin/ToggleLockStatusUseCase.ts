import { UserRepository } from "@/domain/repositories/UserRepository";

export class ToggleLockStatusUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(userId: string, isLocked: boolean) {
    await this.userRepository.updateLockStatus(userId, !isLocked);
  }
}
