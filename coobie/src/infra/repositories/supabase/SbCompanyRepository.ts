// src/infra/repositories/supabase/SbCompanyRepository.ts
import { Company } from "@/domain/entities/Company";
import { CompanyFilter } from "@/domain/repositories/filters/CompanyFilter";
import { CompanyRepository } from "@/domain/repositories/CompanyRepository";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";

interface CompanyDbInsert {
  company_name: string;
  is_locked: boolean;
  user_id: string;
  role_id: string;
}

interface CompanyDbUpdate {
  company_name?: string;
  is_locked?: boolean;
  user_id?: string;
  role_id?: string;
}

export class SbCompanyRepository implements CompanyRepository {
  async count(filter?: CompanyFilter): Promise<number> {
    const companies = await this.findAll(filter);
    return companies.length;
  }

  async findAll(filter?: CompanyFilter): Promise<Company[]> {
    const supabase = await createBrowserSupabaseClient();

    // 회사 데이터 가져오기
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
    }

    const { data: companies, error: companyError } = await query;

    if (companyError) {
      throw new Error(`Failed to fetch companies: ${companyError.message}`);
    }

    if (!companies || companies.length === 0) {
      return [];
    }

    // 회사 ID와 관련된 사용자 데이터 가져오기
    const userIds = companies.map(company => company.user_id).filter(Boolean);

    if (userIds.length === 0) {
      return [];
    }

    const { data: users, error: userError } = await supabase
      .from("user")
      .select("*")
      .in("ID", userIds);

    if (userError) {
      throw new Error(`Failed to fetch user data: ${userError.message}`);
    }

    // 회사 데이터와 사용자 데이터 병합
    const result = companies
      .map(company => {
        const user = users.find(u => u.ID === company.user_id) || {};

        if (
          filter?.isApproved !== undefined &&
          user.is_approved !== filter.isApproved
        ) {
          return null;
        }

        return {
          id: company.ID,
          companyName: company.company_name,
          businessNumber: user.business_number || "",
          isLocked: user.is_locked || false,
          isApproved: user.is_approved || false,
          createdAt: user.created_at,
          userId: company.user_id,
          roleId: company.role_id,
          deletedAt: company.deleted_at
            ? new Date(company.deleted_at)
            : undefined,
        };
      })
      .filter(Boolean) as Company[];

    // 페이지네이션 처리
    if (filter?.offset !== undefined && filter?.limit !== undefined) {
      const start = filter.offset;
      const end = start + filter.limit;
      return result.slice(start, end);
    }

    return result;
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

    // 사업자번호로 사용자(관리자) 조회
    const { data: userData, error: userError } = await supabase
      .from("user")
      .select("ID, role_id")
      .eq("business_number", businessNumber)
      .eq("role_id", "01") // 회사 관리자
      .maybeSingle();

    if (userError) {
      if (userError.code === "PGRST116") {
        return null; // 데이터가 없을 경우 null 반환
      }
      throw new Error(
        `사업자번호 ${businessNumber}로 사용자 조회 중 오류 발생: ${userError.message}`
      );
    }

    if (!userData) {
      return null; // 해당 사업자번호를 가진 관리자가 없으면 null 반환
    }

    // 관리자 ID로 회사 정보 조회
    const { data, error } = await supabase
      .from("company")
      .select("*")
      .eq("user_id", userData.ID)
      .maybeSingle();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(
        `관리자 ID ${userData.ID}로 회사 조회 중 오류 발생: ${error.message}`
      );
    }

    if (!data) {
      return null;
    }

    // 회사 엔티티로 변환하여 반환
    return {
      id: data.ID,
      companyName: data.company_name,
      isLocked: data.is_locked,
      userId: data.user_id,
      roleId: userData.role_id,
      deletedAt: data.deleted_at ? new Date(data.deleted_at) : undefined,
    } as Company;
  }

  async save(company: Company): Promise<Company> {
    const supabase = await createBrowserSupabaseClient();

    // ID 필드를 명시적으로 제외하고 데이터 객체 생성
    const companyData: CompanyDbInsert = {
      company_name: company.companyName,
      is_locked: company.isLocked,
      user_id: company.userId,
      role_id: company.roleId,
    };

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
      isLocked: data.is_locked,
      userId: data.user_id,
      roleId: data.role_id,
      deletedAt: data.deleted_at ? new Date(data.deleted_at) : undefined,
    } as Company;
  }

  async update(company: Company): Promise<Company> {
    const supabase = await createBrowserSupabaseClient();

    const updates: CompanyDbUpdate = {};

    if (company.companyName !== undefined)
      updates.company_name = company.companyName;
    if (company.isLocked !== undefined) updates.is_locked = company.isLocked;
    if (company.userId !== undefined) updates.user_id = company.userId;
    if (company.roleId !== undefined) updates.role_id = company.roleId;

    const { data, error } = await supabase
      .from("company")
      .update(updates)
      .eq("ID", company.id)
      .select()
      .single();

    if (error) {
      throw new Error(
        `Failed to update company with id ${company.id}: ${error.message}`
      );
    }

    return {
      id: data.ID,
      companyName: data.company_name,
      isLocked: data.is_locked,
      userId: data.user_id,
      roleId: data.role_id,
      deletedAt: data.deleted_at ? new Date(data.deleted_at) : undefined,
    } as Company;
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

    // 1. 회사 정보를 가져옵니다
    const { data: companyData, error: companyError } = await supabase
      .from("company")
      .select("user_id")
      .eq("ID", id)
      .single();

    if (companyError) {
      throw new Error(
        `회사 정보를 가져오는 중 오류 발생 (ID: ${id}): ${companyError.message}`
      );
    }

    if (!companyData || !companyData.user_id) {
      throw new Error(`회사 관리자 정보를 찾을 수 없습니다 (회사 ID: ${id})`);
    }

    // 2. 관리자 계정의 승인 상태를 업데이트합니다
    const { error: updateError } = await supabase
      .from("user")
      .update({ is_approved: isApproved })
      .eq("ID", companyData.user_id);

    if (updateError) {
      throw new Error(
        `회사 관리자 승인 상태 업데이트 중 오류 발생 (사용자 ID: ${companyData.user_id}): ${updateError.message}`
      );
    }
  }

  async resetPassword(id: string, defaultPassword: string): Promise<void> {
    try {
      const supabase = await createBrowserSupabaseClient();

      // 회사 정보 조회 (user_id 컬럼을 이용하여 관리자 ID 직접 가져오기)
      const { data: companyData, error: companyError } = await supabase
        .from("company")
        .select("user_id")
        .eq("ID", id)
        .single();

      if (companyError) {
        throw new Error(
          `회사 정보를 가져오는 중 오류 발생 (ID: ${id}): ${companyError.message}`
        );
      }

      if (!companyData || !companyData.user_id) {
        throw new Error(`회사 관리자 정보를 찾을 수 없습니다 (회사 ID: ${id})`);
      }

      // 관리자 ID를 직접 사용하여 비밀번호 초기화 및 잠금 해제
      const adminId = companyData.user_id;

      // 관리자 비밀번호 초기화 및 잠금 해제를 항상 함께 수행
      const { error: updateError } = await supabase
        .from("user")
        .update({
          password: defaultPassword,
          is_locked: false, // 항상 잠금 해제
          login_attempts: 0, // 로그인 시도 횟수 초기화
        })
        .eq("ID", adminId);

      if (updateError) {
        throw new Error(
          `관리자 비밀번호 초기화 중 오류 발생 (ID: ${adminId}): ${updateError.message}`
        );
      }

      const { error: companyUpdateError } = await supabase
        .from("company")
        .update({ is_locked: false })
        .eq("ID", id);

      if (companyUpdateError) {
        throw new Error(
          `회사 잠금 상태 업데이트 중 오류 발생 (ID: ${id}): ${companyUpdateError.message}`
        );
      }
    } catch (error) {
      console.error("비밀번호 초기화 중 예외 발생:", error);
      throw error;
    }
  }
}
