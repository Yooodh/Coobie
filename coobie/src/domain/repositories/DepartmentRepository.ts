import { Department } from "../entities/Department";

export interface DepartmentRepository {
  getAllByCompany(companyId: string): Promise<Department[]>;
}
