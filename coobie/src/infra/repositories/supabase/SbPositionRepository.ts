import { Position } from "@/domain/entities/Position";
import { PositionRepository } from "@/domain/repositories/PositionRepository";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";

export class SbPositionRepository implements PositionRepository {
  private supabase: any;

  constructor() {
    this.supabase = createBrowserSupabaseClient();
  }

  async getAllByCompany(companyId: string): Promise<Position[]> {
    const { data, error } = await this.supabase
      .from("position")
      .select("*")
      .eq("company_id", companyId)
      .is("deleted_at", null);

    if (error) {
      throw new Error(`Failed to fetch positions: ${error.message}`);
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
}