import { createClient } from "@/utils/supabase/server";
import { ScheduleRepository } from "@/domain/repositories/ScheduleRepository";
import { Schedule } from "@/domain/entities/Schedule";
import { ScheduleCategory } from "@/domain/entities/ScheduleCategory";

// Supabase를 이용한 ScheduleRepository 구현체 정의
export class SbScheduleRepository implements ScheduleRepository {
  // Supabase의 schedule 데이터를 Schedule 객체로 변환하는 private 메서드
  private toSchedule(data: any): Schedule {
    return new Schedule(
      data.ID, // 스케줄 ID
      data.user_id, // 사용자 ID
      new Date(data.start_at), // 시작 시간
      new Date(data.date), // 날짜
      data.deleted_at ? new Date(data.deleted_at) : null, // 삭제 시간 (nullable)
      data.schedulecategory_id // 카테고리 ID
    );
  }

  // Supabase의 schedule_categories 데이터를 ScheduleCategory 객체로 변환하는 메서드
  private toScheduleCategory(data: any): ScheduleCategory {
    return new ScheduleCategory(data.ID, data.schedule_type);
  }

  // 전체 스케줄 목록을 불러오는 메서드
  async fetchSchedules(): Promise<Schedule[]> {
    const client = await createClient(); // Supabase 클라이언트 생성
    const { data, error } = await client
      .from("schedule")
      .select("*") // 모든 컬럼 선택
      .order("ID", { ascending: true }); // ID 기준 오름차순 정렬

    // 오류 발생 시 예외 처리
    if (error) throw new Error(`Error fetching schedules: ${error.message}`);

    // 데이터가 존재하면 Schedule 객체 배열로 변환 후 반환
    return (data ?? []).map(this.toSchedule);
  }

  // 전체 스케줄 카테고리 목록을 불러오는 메서드
  async fetchScheduleCategories(): Promise<ScheduleCategory[]> {
    const client = await createClient();
    const { data, error } = await client
      .from("schedule_categories")
      .select("*") // 모든 컬럼 선택
      .order("ID", { ascending: true }); // ID 기준 오름차순 정렬

    if (error)
      throw new Error(`Error fetching schedule categories: ${error.message}`);

    return (data ?? []).map(this.toScheduleCategory); // ScheduleCategory 객체 배열 반환
  }

  // ID로 특정 스케줄 카테고리를 불러오는 메서드
  async fetchScheduleCategoryById(id: number): Promise<ScheduleCategory> {
    const client = await createClient();
    const { data, error } = await client
      .from("schedulecategory")
      .select("*")
      .eq("ID", id) // ID와 일치하는 행 선택
      .single(); // 단일 결과 반환

    if (error)
      throw new Error(
        `Error fetching schedule category by id: ${error.message}`
      );

    return this.toScheduleCategory(data); // ScheduleCategory 객체 반환
  }

  // 스케줄을 다른 카테고리로 이동시키는 메서드
  async moveScheduleToCategory(
    scheduleId: number,
    newCategoryId: number
  ): Promise<Schedule> {
    const client = await createClient();

    // 기존 스케줄이 존재하는지 확인
    const { data: existingSchedule, error: checkError } = await client
      .from("schedule")
      .select("*")
      .eq("ID", scheduleId)
      .maybeSingle();

    // 존재하지 않거나 오류가 있을 경우 예외 발생
    if (checkError || !existingSchedule) {
      throw new Error(`스케줄을 찾을 수 없습니다 (ID: ${scheduleId})`);
    }

    // 스케줄 카테고리 ID 업데이트
    const { data, error } = await client
      .from("schedule")
      .update({ schedulecategory_id: newCategoryId })
      .eq("ID", scheduleId)
      .select("*")
      .single();

    if (error || !data) {
      throw new Error(`스케줄 업데이트 오류 (ID: ${scheduleId})`);
    }

    return this.toSchedule(data); // 업데이트된 Schedule 객체 반환
  }

  // 스케줄 카테고리 자체를 다른 카테고리 ID로 이동시키는 메서드
  async moveScheduleCategory(
    id: number,
    newCategoryId: number
  ): Promise<ScheduleCategory[]> {
    const client = await createClient();

    const { data, error } = await client
      .from("schedule_categories")
      .update({ schedule_category_id: newCategoryId })
      .eq("ID", id);

    if (error) {
      throw new Error(`Error moving schedule category: ${error.message}`);
    }

    return (data ?? []).map(this.toScheduleCategory); // 업데이트된 ScheduleCategory 배열 반환
  }
}
