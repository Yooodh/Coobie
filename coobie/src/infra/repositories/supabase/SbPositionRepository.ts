import { Position } from "@/domain/entities/Position";
import { PositionRepository } from "@/domain/repositories/PositionRepository";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";

export class SbPositionRepository implements PositionRepository {
  private supabase: any;

  constructor() {
    this.supabase = createBrowserSupabaseClient();
  }

  async getAllByCompany(businessNumber: string): Promise<Position[]> {
    try {
      console.log(`직급 조회 시작: businessNumber=${businessNumber}`);

      // 1. business_number로 사용자(관리자) 찾기
      const { data: userData, error: userError } = await this.supabase
        .from("user")
        .select("ID")
        .eq("business_number", businessNumber)
        .eq("role_id", "01") // 회사 관리자
        .single();

      if (userError) {
        console.error("사용자 조회 오류:", userError);
        return [];
      }

      if (!userData) {
        console.error(
          `Business Number ${businessNumber}에 해당하는 관리자를 찾을 수 없음`
        );
        return [];
      }

      // 2. 찾은 사용자 ID로 회사 정보 조회
      const { data: companyData, error: companyError } = await this.supabase
        .from("company")
        .select("ID")
        .eq("user_id", userData.ID)
        .single();

      if (companyError) {
        console.error("회사 조회 오류:", companyError);
        return [];
      }

      if (!companyData) {
        console.error(`User ID ${userData.ID}에 해당하는 회사를 찾을 수 없음`);
        return [];
      }

      const companyId = companyData.ID;
      console.log(`찾은 회사 ID: ${companyId}`);

      // 3. 찾은 회사 ID로 직급 조회
      const { data, error } = await this.supabase
        .from("position")
        .select("*")
        .eq("company_id", companyId)
        .is("deleted_at", null);

      if (error) {
        console.error("직급 조회 오류:", error);
        return [];
      }

      if (!data || data.length === 0) {
        console.log("직급 데이터가 없습니다. 테스트용 데이터 반환");
        // 테스트용 임시 데이터 반환
        return [
          new Position(1001, "사원", new Date(), companyId),
          new Position(1002, "대리", new Date(), companyId),
          new Position(1003, "과장", new Date(), companyId),
          new Position(1004, "차장", new Date(), companyId),
          new Position(1005, "부장", new Date(), companyId),
        ];
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
    } catch (err) {
      console.error("직급 조회 중 예외 발생:", err);
      return [];
    }
  }

  async create(
    businessNumber: string,
    positionName: string
  ): Promise<Position> {
    try {
      // 1. business_number로 사용자(관리자) 찾기
      const { data: userData, error: userError } = await this.supabase
        .from("user")
        .select("ID")
        .eq("business_number", businessNumber)
        .eq("role_id", "01") // 회사 관리자
        .single();

      if (userError) {
        console.error("사용자 조회 오류:", userError);
        throw new Error(`사용자 조회 중 오류: ${userError.message}`);
      }

      if (!userData) {
        throw new Error(`해당 사업자번호의 관리자를 찾을 수 없습니다`);
      }

      // 2. 찾은 사용자 ID로 회사 정보 조회
      const { data: companyData, error: companyError } = await this.supabase
        .from("company")
        .select("ID")
        .eq("user_id", userData.ID)
        .single();

      if (companyError) {
        console.error("회사 조회 오류:", companyError);
        throw new Error(`회사 조회 중 오류: ${companyError.message}`);
      }

      if (!companyData) {
        throw new Error(`해당 관리자의 회사를 찾을 수 없습니다`);
      }

      const companyId = companyData.ID;
      console.log("찾은 회사 ID:", companyId);

      // 3. 직급 이름 중복 확인
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

      // 4. 새 직급 생성 (ID 필드를 생략하여 자동 생성)
      const positionData = {
        // ID 필드를 제거하여 Supabase가 자동으로 UUID 생성하도록 함
        position_name: positionName,
        company_id: companyId,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await this.supabase
        .from("position")
        .insert(positionData)
        .select()
        .single();

      if (error) {
        console.error("직급 생성 오류:", error);
        throw new Error(`직급 생성 중 오류: ${error.message}`);
      }

      return new Position(
        data.ID,
        data.position_name,
        new Date(data.created_at),
        data.company_id,
        undefined
      );
    } catch (error) {
      console.error("직급 생성 중 예외 발생:", error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      // 직급 존재 여부 확인
      const { data: existingPos, error: checkError } = await this.supabase
        .from("position")
        .select("*")
        .eq("ID", id)
        .is("deleted_at", null)
        .maybeSingle();

      if (checkError) {
        throw new Error(`직급 조회 중 오류: ${checkError.message}`);
      }

      if (!existingPos) {
        throw new Error(`ID가 ${id}인 직급을 찾을 수 없습니다`);
      }

      // 해당 직급을 사용 중인 사용자가 있는지 확인
      const { count: userCount, error: countError } = await this.supabase
        .from("user")
        .select("*", { count: "exact", head: true })
        .eq("position_id", id)
        .is("deleted_at", null);

      if (countError) {
        throw new Error(`직급 사용 여부 확인 중 오류: ${countError.message}`);
      }

      if (userCount && userCount > 0) {
        throw new Error(`현재 ${userCount}명의 사용자가 이 직급을 사용하고 있어 삭제할 수 없습니다`);
      }

      // 소프트 삭제 방식 (deleted_at 필드 업데이트)
      const { error } = await this.supabase
        .from("position")
        .update({ deleted_at: new Date().toISOString() })
        .eq("ID", id);

      if (error) {
        throw new Error(`직급 삭제 중 오류: ${error.message}`);
      }
    } catch (error) {
      console.error(`직급 ID ${id} 삭제 중 오류:`, error);
      throw error;
    }
  }
}