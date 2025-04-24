import { User } from "@/domain/entities/User";
import { UserRepository } from "@/domain/repositories/UserRepository";

export class UpdateUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(user: Partial<User> & { id: string }): Promise<User> {
    const existingUser = await this.userRepository.findById(user.id);
    if (!existingUser) {
      throw new Error(`ID가 ${user.id}인 사용자를 찾을 수 없습니다`);
    }

    if (user.username && user.username !== existingUser.username) {
      const userWithSameUsername = await this.userRepository.findByUsername(
        user.username
      );
      if (userWithSameUsername && userWithSameUsername.id !== user.id) {
        throw new Error("이미 사용 중인 사용자명입니다");
      }
    }

    const updatedUser = {
      ...existingUser,
      ...user,
    };

    return await this.userRepository.update(updatedUser);
  }

  async resetPassword(
    id: string,
    defaultPassword: string = "0000"
  ): Promise<void> {
    await this.userRepository.resetPassword(id, defaultPassword);
  }

  async updateLockStatus(id: string, isLocked: boolean): Promise<void> {
    await this.userRepository.updateLockStatus(id, isLocked);
  }
}
