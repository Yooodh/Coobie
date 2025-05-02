// src/application/usecases/user/GetUserUseCase.ts
import { User } from "@/domain/entities/User";
import { UserRepository } from "@/domain/repositories/UserRepository";
import { DepartmentRepository } from "@/domain/repositories/DepartmentRepository";
import { PositionRepository } from "@/domain/repositories/PositionRepository";
import { UserFilter } from "@/domain/repositories/filters/UserFilter";
import { UserDto } from "./dto/UserDto";
import { UserListDto } from "./dto/UserListDto";

export class GetUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private departmentRepository?: DepartmentRepository,
    private positionRepository?: PositionRepository
  ) {}

  /**
   * 사용자 ID로 사용자를 조회합니다.
   */
  async getById(id: string): Promise<UserDto | null> {
    try {
      const user = await this.userRepository.findById(id);
      if (!user) return null;
      
      return this.enrichUserWithDetails(user);
    } catch (error) {
      console.error(`ID로 사용자 조회 중 오류 발생 (ID: ${id}):`, error);
      throw new Error(`사용자 조회 중 오류가 발생했습니다: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 사용자명으로 사용자를 조회합니다.
   */
  async getByUsername(username: string): Promise<UserDto | null> {
    try {
      const user = await this.userRepository.findByUsername(username);
      if (!user) return null;
      
      return this.enrichUserWithDetails(user);
    } catch (error) {
      console.error(`사용자명으로 사용자 조회 중 오류 발생 (Username: ${username}):`, error);
      throw new Error(`사용자 조회 중 오류가 발생했습니다: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 필터 조건에 맞는 모든 사용자를 조회합니다.
   */
  async getAll(filter?: UserFilter): Promise<UserListDto> {
    try {
      const users = await this.userRepository.findAll(filter);
      return this.createPaginatedResponse(users, filter);
    } catch (error) {
      console.error('모든 사용자 조회 중 오류 발생:', error);
      throw new Error(`사용자 목록 조회 중 오류가 발생했습니다: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 특정 역할을 가진 사용자를 조회합니다.
   */
  async getByRoleId(roleId: string, filter?: UserFilter): Promise<UserListDto> {
    try {
      const roleFilter = { ...filter, roleId };
      const users = await this.userRepository.findByRoleId(roleId, filter);
      return this.createPaginatedResponse(users, roleFilter);
    } catch (error) {
      console.error(`역할 ID로 사용자 조회 중 오류 발생 (RoleID: ${roleId}):`, error);
      throw new Error(`사용자 목록 조회 중 오류가 발생했습니다: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * User 엔티티를 기본 UserDto로 변환합니다.
   * @private
   */
  private mapToUserDto(user: User): UserDto {
    return {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      isLocked: user.isLocked,
      isApproved: user.isApproved,
      notificationOn: user.notificationOn,
      roleId: user.roleId,
      businessNumber: user.businessNumber,
      createdAt: user.createdAt.toISOString(),
      departmentId: user.departmentId,
      positionId: user.positionId,
      status: user.status,
      profileMessage: user.profileMessage
    };
  }

  /**
   * 사용자 정보에 부서 및 직급 상세 정보를 추가합니다.
   * @private
   */
  private async enrichUserWithDetails(user: User): Promise<UserDto> {
    const userDto = this.mapToUserDto(user);
    
    try {
      // 부서 정보 가져오기
      if (user.departmentId && this.departmentRepository) {
        // 회사 ID 또는 businessNumber로 부서 목록 조회
        const departments = await this.departmentRepository.getAllByCompany(user.businessNumber);
        const department = departments.find(dept => dept.id === user.departmentId);
        if (department) {
          userDto.departmentName = department.departmentName;
        }
      }
      
      // 직급 정보 가져오기
      if (user.positionId && this.positionRepository) {
        // 회사 ID 또는 businessNumber로 직급 목록 조회
        const positions = await this.positionRepository.getAllByCompany(user.businessNumber);
        const position = positions.find(pos => pos.id === user.positionId);
        if (position) {
          userDto.positionName = position.positionName;
        }
      }
    } catch (error) {
      console.error('사용자 상세 정보 조회 중 오류 발생:', error);
      // 상세 정보 조회 실패 시에도 기본 사용자 정보는 반환
    }
    
    return userDto;
  }

  /**
   * 페이지네이션된 응답을 생성합니다.
   * @private
   */
  private async createPaginatedResponse(users: User[], filter?: UserFilter): Promise<UserListDto> {
    try {
      const total = await this.userRepository.count(filter);
      const limit = filter?.limit || 10;
      const totalPages = Math.ceil(total / limit);
      
      // 각 사용자에 대해 상세 정보를 조회
      const enrichedUsers = await Promise.all(
        users.map(user => this.enrichUserWithDetails(user))
      );
      
      return {
        users: enrichedUsers,
        total,
        totalPages
      };
    } catch (error) {
      console.error('페이지네이션 응답 생성 중 오류 발생:', error);
      throw new Error(`페이지네이션 처리 중 오류가 발생했습니다: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}