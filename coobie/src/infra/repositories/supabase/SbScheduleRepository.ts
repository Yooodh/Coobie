import { createClient } from "@/utils/supabase/server";
import { ScheduleRepository } from "@/domain/repositories/ScheduleRepository";
import { Schedule } from "@/domain/entities/Schedule";
import { ScheduleCategory } from "@/domain/entities/ScheduleCategory";

// 커스텀 에러 클래스
export class ScheduleRepositoryError extends Error {
  constructor(message: string) {
    super(`[ScheduleRepository] ${message}`);
    this.name = "ScheduleRepositoryError";
  }
}

export class SbScheduleRepository implements ScheduleRepository {
  // 테이블명 상수화
  private static readonly SCHEDULE_TABLE = "schedule";
  private static readonly CATEGORY_TABLE = "schedulecategory";

  // 엔티티 변환 메서드
  private toSchedule = (data: any): Schedule => {
    return new Schedule(
      data.ID,
      data.user_id,
      data.started_at ? new Date(data.started_at) : new Date(),
      data.ended_at ? new Date(data.ended_at) : new Date(),
      new Date(data.date),
      data.deleted_at ? new Date(data.deleted_at) : null,
      data.schedulecategory_id,
      data.category
    );
  };

  private toScheduleCategory = (data: any): ScheduleCategory => {
    return new ScheduleCategory(data.ID, data.schedule_type);
  };

  // 전체 스케줄 조회
  async fetchSchedules(): Promise<Schedule[]> {
    try {
      const client = await createClient();
      const { data, error } = await client
        .from(SbScheduleRepository.SCHEDULE_TABLE)
        .select("*")
        .order("ID", { ascending: true });

      if (error) {
        throw new ScheduleRepositoryError(
          `스케줄 목록 조회 실패: ${error.message}`
        );
      }

      return (data ?? []).map(this.toSchedule);
    } catch (err) {
      throw new ScheduleRepositoryError(
        `스케줄 목록 조회 중 오류 발생: ${(err as Error).message}`
      );
    }
  }

  // 전체 스케줄 카테고리 조회
  async fetchScheduleCategories(): Promise<ScheduleCategory[]> {
    try {
      const client = await createClient();
      const { data, error } = await client
        .from(SbScheduleRepository.CATEGORY_TABLE)
        .select("*")
        .order("ID", { ascending: true });

      if (error) {
        throw new ScheduleRepositoryError(
          `카테고리 목록 조회 실패: ${error.message}`
        );
      }

      return (data ?? []).map(this.toScheduleCategory);
    } catch (err) {
      throw new ScheduleRepositoryError(
        `카테고리 목록 조회 중 오류 발생: ${(err as Error).message}`
      );
    }
  }

  // ID로 특정 스케줄 카테고리 조회
  async fetchScheduleCategoryById(id: number): Promise<ScheduleCategory> {
    try {
      const client = await createClient();
      const { data, error } = await client
        .from(SbScheduleRepository.CATEGORY_TABLE)
        .select("*")
        .eq("ID", id)
        .single();

      if (error) {
        throw new ScheduleRepositoryError(
          `카테고리 조회 실패 (ID: ${id}): ${error.message}`
        );
      }

      return this.toScheduleCategory(data);
    } catch (err) {
      throw new ScheduleRepositoryError(
        `카테고리 조회 중 오류 발생 (ID: ${id}): ${(err as Error).message}`
      );
    }
  }

  // 스케줄을 다른 카테고리로 이동
  async moveScheduleToCategory(
    scheduleId: number,
    newCategoryId: number
  ): Promise<Schedule> {
    try {
      const client = await createClient();

      // 스케줄 존재 여부 확인
      const { data: existingSchedule, error: checkError } = await client
        .from(SbScheduleRepository.SCHEDULE_TABLE)
        .select("*")
        .eq("ID", scheduleId)
        .maybeSingle();

      if (checkError || !existingSchedule) {
        throw new ScheduleRepositoryError(
          `스케줄을 찾을 수 없습니다 (ID: ${scheduleId})`
        );
      }

      // 스케줄 카테고리 업데이트
      const { data, error } = await client
        .from(SbScheduleRepository.SCHEDULE_TABLE)
        .update({ schedulecategory_id: newCategoryId })
        .eq("ID", scheduleId)
        .select("*")
        .single();

      if (error || !data) {
        throw new ScheduleRepositoryError(
          `스케줄 카테고리 업데이트 실패 (ID: ${scheduleId}): ${error?.message}`
        );
      }

      return this.toSchedule(data);
    } catch (err) {
      throw new ScheduleRepositoryError(
        `스케줄 이동 중 오류 발생: ${(err as Error).message}`
      );
    }
  }

  // 카테고리 이동
  async moveScheduleCategory(
    id: number,
    newCategoryId: number
  ): Promise<ScheduleCategory[]> {
    try {
      const client = await createClient();
      const { data, error } = await client
        .from(SbScheduleRepository.CATEGORY_TABLE)
        .update({ schedule_category_id: newCategoryId })
        .eq("ID", id)
        .select("*");

      if (error) {
        throw new ScheduleRepositoryError(
          `카테고리 이동 실패 (ID: ${id}): ${error.message}`
        );
      }

      return (data ?? []).map(this.toScheduleCategory);
    } catch (err) {
      throw new ScheduleRepositoryError(
        `카테고리 이동 중 오류 발생: ${(err as Error).message}`
      );
    }
  }

  // 스케줄 생성
  async createSchedule(schedule: Schedule): Promise<Schedule> {
    try {
      const client = await createClient();
      const { data, error } = await client
        .from(SbScheduleRepository.SCHEDULE_TABLE)
        .insert({
          user_id: schedule.userId,
          started_at: schedule.startedAt,
          date: schedule.date,
          deleted_at: schedule.deletedAt,
          schedulecategory_id: schedule.scheduleCategoryId,
          ended_at: schedule.endedAt,
          category: schedule.category,
        })
        .select("*")
        .single();

      if (error) {
        throw new ScheduleRepositoryError(`스케줄 생성 실패: ${error.message}`);
      }

      return this.toSchedule(data);
    } catch (err) {
      throw new ScheduleRepositoryError(
        `스케줄 생성 중 오류 발생: ${(err as Error).message}`
      );
    }
  }

  // 스케줄 삭제
  async deleteSchedule(userId: string, scheduleId: number): Promise<Schedule> {
    try {
      const client = await createClient();

      // 해당 사용자의 스케줄인지 확인
      const { data: existingSchedule, error: checkError } = await client
        .from(SbScheduleRepository.SCHEDULE_TABLE)
        .select("*")
        .eq("ID", scheduleId)
        .eq("user_id", userId)
        .maybeSingle();

      if (checkError || !existingSchedule) {
        throw new ScheduleRepositoryError(
          `해당 사용자의 스케줄을 찾을 수 없습니다 (ID: ${scheduleId})`
        );
      }

      // soft delete 구현
      const { data, error } = await client
        .from(SbScheduleRepository.SCHEDULE_TABLE)
        .update({ deleted_at: new Date().toISOString() })
        .eq("ID", scheduleId)
        .select("*")
        .single();

      if (error || !data) {
        throw new ScheduleRepositoryError(
          `스케줄 삭제 실패 (ID: ${scheduleId}): ${error?.message}`
        );
      }

      return this.toSchedule(data);
    } catch (err) {
      throw new ScheduleRepositoryError(
        `스케줄 삭제 중 오류 발생: ${(err as Error).message}`
      );
    }
  }

  // 스케줄 수정
  async updateSchedule(schedule: Schedule): Promise<Schedule> {
    try {
      const client = await createClient();

      // 날짜 포맷 변환
      const updateData = {
        user_id: schedule.userId,
        started_at: schedule.startedAt.toISOString(),
        ended_at: schedule.endedAt.toISOString(),
        date: schedule.date.toISOString(),
        deleted_at: schedule.deletedAt?.toISOString() ?? null,
        schedulecategory_id: schedule.scheduleCategoryId,
        category: schedule.category,
      };

      const { data, error } = await client
        .from(SbScheduleRepository.SCHEDULE_TABLE)
        .update(updateData)
        .eq("ID", schedule.id)
        .select("*")
        .single();

      if (error || !data) {
        throw new ScheduleRepositoryError(
          `스케줄 업데이트 실패 (ID: ${schedule.id}): ${error?.message}`
        );
      }

      return this.toSchedule(data);
    } catch (err) {
      throw new ScheduleRepositoryError(
        `스케줄 업데이트 중 오류 발생: ${(err as Error).message}`
      );
    }
  }
}
