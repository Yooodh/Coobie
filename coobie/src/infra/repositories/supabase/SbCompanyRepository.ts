// src/infra/repositories/supabase/SbCompanyRepository.ts
import { Company } from "@/domain/entities/Company";
import { CompanyFilter } from "@/domain/repositories/filters/CompanyFilter";
import { CompanyRepository } from "@/domain/repositories/CompanyRepository";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";


export class SbCompanyRepository implements CompanyRepository {
  async count(filter?: CompanyFilter): Promise<number> {
    const supabase = await createBrowserSupabaseClient();

    let query = supabase
      .from("company")
      .select("*", { count: "exact", head: true });

    if (filter) {
      if (filter.companyName) {
        query = query.ilike("company_name", `%${filter.companyName}%`);
      }
      if (filter.businessNumber) {
        query = query.eq("business_number", filter.businessNumber);
      }
      if (filter.isLocked !== undefined) {
        query = query.eq("is_locked", filter.isLocked);
      }
      if (filter.isApproved !== undefined) {
        query = query.eq("is_approved", filter.isApproved);
      }
    }

    const { count, error } = await query;

    if (error) {
      throw new Error(`Failed to count companies: ${error.message}`);
    }

    return count || 0;
  }

  async findAll(filter?: CompanyFilter): Promise<Company[]> {
    const supabase = await createBrowserSupabaseClient();

    let query = supabase.from("company").select("*").is("deleted_at", null);

    if (filter) {
      if (filter.companyName) {
        query = query.ilike("company_name", `%${filter.companyName}%`);
      }
      if (filter.businessNumber) {
        query = query.eq("business_number", filter.businessNumber);
      }
      if (filter.isLocked !== undefined) {
        query = query.eq("is_locked", filter.isLocked);
      }
      if (filter.isApproved !== undefined) {
        query = query.eq("is_approved", filter.isApproved);
      }

      const offset = filter.offset ?? 0;
      const limit = filter.limit ?? 10;
      query = query.range(offset, offset + limit - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch companies: ${error.message}`);
    }

    return data.map((company) => {
      return {
        id: company.ID,
        companyName: company.company_name,
        businessNumber: company.business_number,
        isLocked: company.is_locked,
        deletedAt: company.deleted_at ? new Date(company.deleted_at) : null,
      } as unknown as Company;
    });
  }

  async findById(id: string): Promise<Company | null> {
    const supabase = await createBrowserSupabaseClient();

    const { data, error } = await supabase
      .from("company")
      .select("*")
      .eq("ID", id)
      .single();

    if (error) {
      // If no data is found, return null without throwing an error
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(
        `Failed to fetch company with id ${id}: ${error.message}`
      );
    }

    if (!data) {
      return null;
    }

    return {
      id: data.ID,
      companyName: data.company_name,
      businessNumber: data.business_number,
      isLocked: data.is_locked,
      deletedAt: data.deleted_at ? new Date(data.deleted_at) : null,
    } as unknown as Company;
  }

  async findByBusinessNumber(businessNumber: string): Promise<Company | null> {
    const supabase = await createBrowserSupabaseClient();

    const { data, error } = await supabase
      .from("company")
      .select("*")
      .eq("business_number", businessNumber)
      .single();

    if (error) {
      // If no data is found, return null without throwing an error
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(
        `Failed to fetch company with business number ${businessNumber}: ${error.message}`
      );
    }

    if (!data) {
      return null;
    }

    return {
      id: data.ID,
      companyName: data.company_name,
      businessNumber: data.business_number,
      isLocked: data.is_locked,
      deletedAt: data.deleted_at ? new Date(data.deleted_at) : null,
    } as unknown as Company;
  }

  async save(company: Company): Promise<Company> {
    const supabase = await createBrowserSupabaseClient();

    // 저장할 데이터 객체 생성
    const companyData: any = {
      company_name: company.companyName,
      business_number: company.businessNumber,
      is_locked: company.isLocked,
    };

    // ID가 제공된 경우에만 ID 필드 포함
    if (company.Id && company.Id.trim() !== "") {
      companyData.ID = company.Id;
    }

    const { data, error } = await supabase
      .from("company")
      .insert(companyData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save company: ${error.message}`);
    }

    return {
      id: data.ID,
      companyName: data.company_name,
      businessNumber: data.business_number,
      isLocked: data.is_locked,
      deletedAt: data.deleted_at ? new Date(data.deleted_at) : null,
    } as unknown as Company;
  }

  async update(company: Company): Promise<Company> {
    const supabase = await createBrowserSupabaseClient();

    const updates: any = {};

    if (company.companyName !== undefined)
      updates.company_name = company.companyName;
    if (company.businessNumber !== undefined)
      updates.business_number = company.businessNumber;
    if (company.isLocked !== undefined) updates.is_locked = company.isLocked;

    const { data, error } = await supabase
      .from("company")
      .update(updates)
      .eq("ID", company.Id)
      .select()
      .single();

    if (error) {
      throw new Error(
        `Failed to update company with id ${company.Id}: ${error.message}`
      );
    }

    return {
      id: data.ID,
      companyName: data.company_name,
      businessNumber: data.business_number,
      isLocked: data.is_locked,
      deletedAt: data.deleted_at ? new Date(data.deleted_at) : null,
    } as unknown as Company;
  }

  async delete(id: string): Promise<void> {
    const supabase = await createBrowserSupabaseClient();

    // Soft delete by updating the deleted_at field
    const { error } = await supabase
      .from("company")
      .update({ deleted_at: new Date().toISOString() })
      .eq("ID", id);

    if (error) {
      throw new Error(
        `Failed to delete company with id ${id}: ${error.message}`
      );
    }
  }

  async updateLockStatus(id: string, isLocked: boolean): Promise<void> {
    const supabase = await createBrowserSupabaseClient();

    const { error } = await supabase
      .from("company")
      .update({ is_locked: isLocked })
      .eq("ID", id);

    if (error) {
      throw new Error(
        `Failed to update lock status for company with id ${id}: ${error.message}`
      );
    }
  }

  async updateApprovalStatus(id: string, isApproved: boolean): Promise<void> {
    const supabase = await createBrowserSupabaseClient();

    const { error } = await supabase
      .from("company")
      .update({ is_approved: isApproved })
      .eq("ID", id);

    if (error) {
      throw new Error(
        `Failed to update approval status for company with id ${id}: ${error.message}`
      );
    }
  }

  async resetPassword(id: string, defaultPassword: string): Promise<void> {
    // 회사의 관리자 사용자를 찾아서 비밀번호 초기화
    const supabase = await createBrowserSupabaseClient();

    // 회사 정보 조회
    const { data: companyData, error: companyError } = await supabase
      .from("company")
      .select("business_number")
      .eq("ID", id)
      .single();

    if (companyError) {
      throw new Error(
        `Failed to fetch company info with id ${id}: ${companyError.message}`
      );
    }

    // 회사 관리자 사용자 찾기 (role_id = 01 & business_number = company.business_number)
    const { data: adminData, error: adminError } = await supabase
      .from("user")
      .select("ID")
      .eq("role_id", "01")
      .eq("business_number", companyData.business_number)
      .single();

    if (adminError) {
      throw new Error(
        `Failed to find admin user for company id ${id}: ${adminError.message}`
      );
    }

    // 관리자 비밀번호 초기화
    const { error: updateError } = await supabase
      .from("user")
      .update({
        password: defaultPassword,
        is_locked: false,
        login_attempts: 0,
      })
      .eq("ID", adminData.ID);

    if (updateError) {
      throw new Error(
        `Failed to reset password for admin user with id ${adminData.ID}: ${updateError.message}`
      );
    }
  }
}
