// src/application/usecases/dtos/index.ts

// 사용자 관련
export interface AuthUserDto {
  id: string;
  username: string;
  nickname: string;
  roleId: string;
  businessNumber?: string;
}

export interface LoginRequestDto {
  username: string;
  password: string;
}

export interface AuthResponseDto {
  user: AuthUserDto;
  redirectUrl: string;
}

export interface UserListDto {
  id: string;
  username: string;
  nickname: string;
  isLocked: boolean;
  isApproved: boolean;
  notificationOn: boolean;
  roleId: string;
  businessNumber: string;
  createdAt: string;
  departmentId?: number;
  positionId?: number;
  status?: 'online' | 'offline' | 'busy' | 'away';
}

export interface UserUpdateDto {
  username?: string;
  nickname?: string;
  departmentId?: number | null;
  positionId?: number | null;
  isLocked?: boolean;
  isApproved?: boolean;
  notificationOn?: boolean;
}

// 회사 관련
export interface CompanyDto {
  id: string;
  companyName: string;
  businessNumber: string;
  isLocked: boolean;
  isApproved: boolean;
  createdAt: string;
  userId?: string;
  roleId?: string;
}

// 부서 관련
export interface DepartmentDto {
  id: number;
  departmentName: string;
  createdAt: string;
  companyId: string;
}

// 직급 관련
export interface PositionDto {
  id: number;
  positionName: string;
  createdAt: string;
  companyId: string;
}

// API 응답 관련 공통 타입
export interface ApiResponse<T> {
  message?: string;
  error?: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  totalPages: number;
}