import { Position } from "@/domain/entities/Position";

export interface PositionRepository {
  getAllByCompany(companyId: string): Promise<Position[]>; // 회사별 직급 가져오기
}
