import { Department } from "@/domain/entities/Department";
import { DepartmentRepository } from "@/domain/repositories/DepartmentRepository";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";

export class SbDepartmentRepository implements DepartmentRepository {
  private supabase: any;

  constructor() {
    this.supabase = createBrowserSupabaseClient();
  }

  async getAllByCompany(companyId: string): Promise<Department[]> {
    const { data, error } = await this.supabase
      .from("department")
      .select("*")
      .eq("company_id", companyId)
      .is("deleted_at", null);

    if (error) {
      throw new Error(`Failed to fetch departments: ${error.message}`);
    }

    return data.map(
      (dept) =>
        new Department(
          dept.ID,
          dept.department_name,
          new Date(dept.created_at),
          dept.company_id,
          dept.deleted_at ? new Date(dept.deleted_at) : undefined
        )
    );
  }
}