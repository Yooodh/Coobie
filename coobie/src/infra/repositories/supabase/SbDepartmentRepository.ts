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

  async create(businessNumber: string, departmentName: string): Promise<Department> {
    // 먼저 business_number로 회사를 조회합니다 (user 테이블에서)
    const { data: users, error: userError } = await this.supabase
      .from("user")
      .select("ID, role_id")
      .eq("business_number", businessNumber)
      .eq("role_id", "01") // 회사 관리자 역할
      .maybeSingle();
  
    if (userError) {
      console.error("사용자 조회 오류:", userError);
      throw new Error(`사용자 조회 중 오류: ${userError.message}`);
    }
  
    if (!users) {
      throw new Error("해당 사업자번호의 관리자를 찾을 수 없습니다");
    }
  
    const adminId = users.ID;
  
    // 관리자 ID로 회사 조회
    const { data: company, error: companyError } = await this.supabase
      .from("company")
      .select("ID")
      .eq("user_id", adminId)
      .maybeSingle();
  
    if (companyError) {
      console.error("회사 조회 오류:", companyError);
      throw new Error(`회사 조회 중 오류: ${companyError.message}`);
    }
  
    if (!company) {
      throw new Error("해당 관리자의 회사를 찾을 수 없습니다");
    }
  
    const companyId = company.ID;
    console.log("찾은 회사 ID:", companyId);
  
    // 부서 이름 중복 확인
    const { data: existingDept, error: checkError } = await this.supabase
      .from("department")
      .select("*")
      .eq("company_id", companyId)
      .eq("department_name", departmentName)
      .is("deleted_at", null)
      .maybeSingle();
  
    if (checkError) {
      throw new Error(`부서 중복 확인 중 오류: ${checkError.message}`);
    }
  
    if (existingDept) {
      throw new Error("이미 존재하는 부서명입니다");
    }
  
    // 마지막 ID 값 가져오기
    const { data: lastDept, error: lastIdError } = await this.supabase
      .from("department")
      .select("ID")
      .order("ID", { ascending: false })
      .limit(1)
      .single();
  
    let newId = 1100; // 기본값
    
    if (lastIdError) {
      // 데이터가 없는 경우가 아닌 다른 오류인 경우
      if (!lastIdError.message.includes("No rows found")) {
        throw new Error(`마지막 ID 조회 중 오류: ${lastIdError.message}`);
      }
      // No rows found는 무시하고 기본 ID 사용
    } else if (lastDept) {
      // 마지막 ID에 1 추가
      newId = lastDept.ID + 1;
    }
  
    console.log("Creating department with ID:", newId, "company_id:", companyId);
  
    // 새 부서 생성
    const { data, error } = await this.supabase
      .from("department")
      .insert({
        ID: newId,
        department_name: departmentName,
        company_id: companyId,  // 찾은 실제 회사 ID 사용
        created_at: new Date().toISOString(),
      })
      .select()
      .single();
  
    if (error) {
      console.error("Department creation error:", error);
      throw new Error(`부서 생성 중 오류: ${error.message}`);
    }
  
    return new Department(
      data.ID,
      data.department_name,
      new Date(data.created_at),
      data.company_id,
      undefined
    );
  }

  async delete(id: number): Promise<void> {
    // 소프트 삭제 방식 (deleted_at 필드 업데이트)
    const { error } = await this.supabase
      .from("department")
      .update({ deleted_at: new Date().toISOString() })
      .eq("ID", id);

    if (error) {
      throw new Error(`부서 삭제 중 오류: ${error.message}`);
    }
  }
}
