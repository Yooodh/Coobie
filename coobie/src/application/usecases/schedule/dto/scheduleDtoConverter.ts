import { BlockType } from "@/types/ScheduleType";
import { CreateScheduleDto } from "@/application/usecases/schedule/dto/CreateScheduleDto";

const SCHEDULE_CATEGORY_MAP: Record<BlockType["type"], number> = {
  외근: 0,
  회의: 1,
  휴가: 2,
};

const CATEGORY_TYPE_MAP: Record<number, BlockType["type"]> = {
  0: "외근",
  1: "회의",
  2: "휴가",
};

const COLOR_MAP: Record<BlockType["type"], string> = {
  외근: "#7EDC92",
  회의: "#7EC6F7",
  휴가: "#F7B299",
};

// BlockType → CreateScheduleDto (저장용, KST→UTC 변환)
export function convertBlockToDto(
  block: BlockType,
  userId: string
): CreateScheduleDto {
  // 시간 포맷 (예: 9 → "09:00:00")
  const formatTime = (hour: number) => String(hour).padStart(2, "0") + ":00:00";

  // 현재 날짜와 함께 유효한 시간 문자열 생성
  const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
  const startLocal = `${today}T${formatTime(block.startTime)}Z`;
  const endLocal = `${today}T${formatTime(block.startTime + block.duration)}Z`;

  const startedAt = new Date(startLocal);
  const endedAt = new Date(endLocal);

  // endedAt에서 1시간 빼기
  endedAt.setHours(endedAt.getHours() - 1);

  // let idNum = 0;
  // if (typeof block.id === "string" && block.id.includes("-")) {
  //   idNum = 0;
  // } else if (typeof block.id === "number") {
  //   idNum = block.id;
  // }

  return new CreateScheduleDto(
    block.id,
    userId,
    startedAt,
    endedAt,
    new Date(block.date),
    SCHEDULE_CATEGORY_MAP[block.type]
  );
}

// DB Schedule → BlockType (차트 표시용, UTC→KST 변환은 자동)
export function convertScheduleToBlock(schedule: any): BlockType {
  const categoryId =
    schedule.schedulecategory_id ?? schedule.scheduleCategoryId;
  const startedAt = new Date(schedule.started_at ?? schedule.startedAt);
  const endedAt = new Date(schedule.ended_at ?? schedule.endedAt);

  const type = CATEGORY_TYPE_MAP[categoryId] || "외근";
  const color = COLOR_MAP[type];

  return {
    id: schedule.ID ?? schedule.id,
    date: (schedule.date ?? "").slice(0, 10),
    startTime: startedAt.getHours(),
    duration: endedAt.getHours() - startedAt.getHours(),
    type,
    color,
    expansionState: type !== "회의" ? 0 : undefined,
  };
}
