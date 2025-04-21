import { Position } from "@/domain/entities/Position";
import { PositionRepository } from "@/domain/repositories/PositionRepository";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";

export class SbPositionRepository implements PositionRepository {
  private supabase: any;

  constructor() {
    this.supabase = createBrowserSupabaseClient();
  }
  // async getAllByCompany(companyId: string): Promise<Position[]> {
  //   const { data, error } = await this.supabase
  //     .from("position")
  //     .select("*")
  //     .eq("company_id", companyId)
  //     .is("deleted_at", null);

  //   if (error) {
  //     throw new Error(`Failed to fetch positions: ${error.message}`);
  //   }

  //   return data.map(
  //     (pos) =>
  //       new Position(
  //         pos.ID,
  //         pos.position_name,
  //         new Date(pos.created_at),
  //         pos.company_id,
  //         pos.deleted_at ? new Date(pos.deleted_at) : undefined
  //       )
  //   );
  // }
  async getAllByCompany(businessNumber: string): Promise<Position[]> {
    // 먼저 business_number로 회사 ID 조회
    const { data: companyData, error: companyError } = await this.supabase
      .from("company")
      .select("ID")
      .eq("business_number", businessNumber)
      .single();

    if (companyError) {
      console.error("회사 조회 오류:", companyError);
      return []; // 조회 실패 시 빈 배열 반환
    }

    if (!companyData) {
      console.error(`Business Number가 ${businessNumber}인 회사를 찾을 수 없음`);
      return [];
    }

    const companyId = companyData.ID;
    console.log(`비즈니스 번호 ${businessNumber}로 찾은 회사 ID: ${companyId}`);

    // 찾은 회사 ID로 직급 조회
    const { data, error } = await this.supabase
      .from("position")
      .select("*")
      .eq("company_id", companyId)
      .is("deleted_at", null);

    if (error) {
      console.error("직급 조회 오류:", error);
      return [];
    }

    return data.map(
      (pos) =>
        new Position(
          pos.ID,
          pos.position_name,
          new Date(pos.created_at),
          pos.company_id,
          pos.deleted_at ? new Date(pos.deleted_at) : undefined
        )
    );
  }


  async create(businessNumber: string, positionName: string): Promise<Position> {
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
  
    // 직급 이름 중복 확인
    const { data: existingPos, error: checkError } = await this.supabase
      .from("position")
      .select("*")
      .eq("company_id", companyId)
      .eq("position_name", positionName)
      .is("deleted_at", null)
      .maybeSingle();
  
    if (checkError) {
      throw new Error(`직급 중복 확인 중 오류: ${checkError.message}`);
    }
  
    if (existingPos) {
      throw new Error("이미 존재하는 직급명입니다");
    }
  
    // 마지막 ID 값 가져오기
    const { data: lastPosition, error: lastIdError } = await this.supabase
      .from("position")
      .select("ID")
      .order("ID", { ascending: false })
      .limit(1)
      .single();
  
    let newId = 1000; // 기본값
    
    if (lastIdError) {
      // 데이터가 없는 경우가 아닌 다른 오류인 경우
      if (!lastIdError.message.includes("No rows found")) {
        throw new Error(`마지막 ID 조회 중 오류: ${lastIdError.message}`);
      }
      // No rows found는 무시하고 기본 ID 사용
    } else if (lastPosition) {
      // 마지막 ID에 1 추가
      newId = lastPosition.ID + 1;
    }
  
    console.log("Creating position with ID:", newId, "company_id:", companyId);
  
    // 새 직급 생성
    const positionData = {
      ID: newId,
      position_name: positionName,
      company_id: companyId,  // 찾은 실제 회사 ID 사용
      created_at: new Date().toISOString()
    };
    
    console.log("Creating position with data:", positionData);
    
    const { data, error } = await this.supabase
      .from("position")
      .insert(positionData)
      .select()
      .single();
  
    if (error) {
      console.error("Position creation error:", error);
      throw new Error(`직급 생성 중 오류: ${error.message}`);
    }
  
    return new Position(
      data.ID,
      data.position_name,
      new Date(data.created_at),
      data.company_id,
      undefined
    );
  }
  async delete(id: number): Promise<void> {
    // 소프트 삭제 방식 (deleted_at 필드 업데이트)
    const { error } = await this.supabase
      .from("position")
      .update({ deleted_at: new Date().toISOString() })
      .eq("ID", id);

    if (error) {
      throw new Error(`직급 삭제 중 오류: ${error.message}`);
    }
  }
}