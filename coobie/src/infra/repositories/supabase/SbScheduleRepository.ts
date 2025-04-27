import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import { ScheduleRepository } from "@/domain/repositories/ScheduleRepository";
import { Schedule } from "@/domain/entities/Schedule";
import { ScheduleCategory } from "@/domain/entities/ScheduleCategory";
import { ScheduleRepositoryError } from "./ScheduleRepositoryError";

export class SbScheduleRepository implements ScheduleRepository {
  private static readonly SCHEDULE_TABLE = "schedule";
  private static readonly CATEGORY_TABLE = "schedulecategory";

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

  // 변경된 부분: userId 필터 추가
  async fetchSchedules(userId?: string): Promise<Schedule[]> {
    try {
      const client = await createBrowserSupabaseClient();
      let query = client
        .from(SbScheduleRepository.SCHEDULE_TABLE)
        .select("*")
        .is("deleted_at", null);

      // userId가 제공된 경우 필터 추가
      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query.order("ID", { ascending: true });

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

  // 이하 기존 메서드 유지
  async fetchScheduleCategories(): Promise<ScheduleCategory[]> {
    try {
      const client = await createBrowserSupabaseClient();
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

  async fetchScheduleCategoryById(id: number): Promise<ScheduleCategory> {
    try {
      const client = await createBrowserSupabaseClient();
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

  async moveScheduleToCategory(
    // ← 인터페이스와 이름 일치
    scheduleId: number,
    newCategoryId: number
  ): Promise<Schedule> {
    try {
      const client = await createBrowserSupabaseClient();
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

  async createSchedule(schedule: Schedule): Promise<Schedule> {
    try {
      const client = await createBrowserSupabaseClient();
      const { data, error } = await client
        .from(SbScheduleRepository.SCHEDULE_TABLE)
        .insert({
          user_id: schedule.userId,
          started_at: schedule.startedAt,
          date: schedule.date,
          deleted_at: schedule.deletedAt,
          schedulecategory_id: schedule.scheduleCategoryId,
          ended_at: schedule.endedAt,
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

  async deleteSchedule(userId: string, scheduleId: number): Promise<Schedule> {
    try {
      const client = await createBrowserSupabaseClient();
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

      const { error } = await client
        .from(SbScheduleRepository.SCHEDULE_TABLE)
        .delete()
        .eq("ID", scheduleId)
        .eq("user_id", userId);

      if (error) {
        throw new ScheduleRepositoryError(
          `스케줄 삭제 실패 (ID: ${scheduleId}): ${error?.message}`
        );
      }

      return this.toSchedule(existingSchedule);
    } catch (err) {
      throw new ScheduleRepositoryError(
        `스케줄 삭제 중 오류 발생: ${(err as Error).message}`
      );
    }
  }

  async updateSchedule(schedule: Schedule): Promise<Schedule> {
    try {
      const client = await createBrowserSupabaseClient();
      const updateData = {
        user_id: schedule.userId,
        started_at: schedule.startedAt.toISOString(),
        ended_at: schedule.endedAt.toISOString(),
        date: schedule.date.toISOString(),
        deleted_at: schedule.deletedAt?.toISOString() ?? null,
        schedulecategory_id: schedule.scheduleCategoryId,
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

  async findByDateAndTime(
    userId: string,
    date: Date,
    startedAt: Date
  ): Promise<Schedule[]> {
    try {
      const client = await createBrowserSupabaseClient();
      const dateStr = date.toISOString().split("T")[0];
      const startTimeStr = startedAt.toISOString();

      const { data, error } = await client
        .from(SbScheduleRepository.SCHEDULE_TABLE)
        .select("*")
        .eq("user_id", userId)
        .eq("date", dateStr)
        .eq("started_at", startTimeStr)
        .is("deleted_at", null);

      if (error) {
        throw new ScheduleRepositoryError(`일정 검색 실패: ${error.message}`);
      }

      return (data ?? []).map(this.toSchedule);
    } catch (err) {
      throw new ScheduleRepositoryError(
        `일정 검색 중 오류 발생: ${(err as Error).message}`
      );
    }
  }
}
