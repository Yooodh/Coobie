import { UserRepository } from "@/domain/repositories/UserRepository";

export class DeleteUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(id: string): Promise<void> {
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new Error(`User with ID ${id} not found`);
    }

    await this.userRepository.delete(id);
  }
}
