import { Position } from "@/domain/entities/Position";

export interface PositionRepository {
  getAllByCompany(companyId: string): Promise<Position[]>;
  create(companyId: string, positionName: string): Promise<Position>;
  delete?(id: number): Promise<void>; // 선택적 메서드 (추후 구현)
}