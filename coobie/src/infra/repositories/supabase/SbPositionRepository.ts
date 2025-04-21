import { Position } from "@/domain/entities/Position";
import { PositionRepository } from "@/domain/repositories/PositionRepository";
import { createClient } from "@/utils/supabase/server";

export class SbPositionRepository implements PositionRepository {
  async getAllByCompany(companyId: string): Promise<Position[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("positions")
      .select("*")
      .eq("company_id", companyId)
      .is("deleted_at", null);

    if (error) {
      throw new Error(`Failed to fetch positions: ${error.message}`);
    }

    return data.map(
      (pos) =>
        new Position(
          pos.id,
          pos.position_name,
          new Date(pos.created_at),
          pos.companyId
        )
    );
  }
}
