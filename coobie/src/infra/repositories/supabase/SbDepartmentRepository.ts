import { Department } from "@/domain/entities/Department";
import { DepartmentRepository } from "@/domain/repositories/DepartmentRepository";
import { createClient } from "@/utils/supabase/server";

export class SbDepartmentRepository implements DepartmentRepository {
  async getAllByCompany(companyId: string): Promise<Department[]> {
    const supabse = await createClient();
    const { data, error } = await supabse
      .from("departments")
      .select("*")
      .eq("company_id", companyId)
      .is("deleted_at", null);

    if (error) {
      throw new Error(`Failed to fetch departments: ${error.message}`);
    }

    return data.map(
      (dept) =>
        new Department(
          dept.id,
          dept.department_name,
          new Date(dept.created_at),
          dept.company_id,
        )
    );
  }
}
