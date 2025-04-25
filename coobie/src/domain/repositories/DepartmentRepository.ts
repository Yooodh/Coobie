import { Department } from "../entities/Department";

export interface DepartmentRepository {
  getAllByCompany(companyId: string): Promise<Department[]>;
  create(companyId: string, departmentName: string): Promise<Department>;
  delete(id: number): Promise<void>;
}
