import { BlockType } from "@/types/ScheduleType";
import { CreateScheduleDto } from "@/application/usecases/schedule/dto/CreateScheduleDto";
import { FetchSchedulesDto } from "@/application/usecases/schedule/dto/FetchSchedulesDto";

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

// 블록→DTO (클라이언트→서버) 변환 함수 수정
export function convertBlockToDto(
  block: BlockType,
  userId: string
): CreateScheduleDto {
  // 로그 추가
  console.log("변환 전 블록:", block);

  // 현재 매핑 로그 확인
  const categoryId = SCHEDULE_CATEGORY_MAP[block.type];
  console.log(`블록 타입 "${block.type}"의 카테고리 ID: ${categoryId}`);

  // KST 시간 생성 (타임존 명시)
  const kstDate = new Date(
    `${block.date}T${String(block.startTime).padStart(2, "0")}:00:00+09:00`
  );
  console.log("KST 기준 시간:", kstDate.toISOString());

  // KST → UTC 변환
  const utcStarted = new Date(kstDate.getTime() - 9 * 60 * 60 * 1000);
  const utcEnded = new Date(
    new Date(
      `${block.date}T${String(block.startTime + block.duration - 1).padStart(
        2,
        "0"
      )}:59:59+09:00`
    ).getTime() -
      9 * 60 * 60 * 1000
  );

  return new CreateScheduleDto(
    block.id,
    userId,
    utcStarted,
    utcEnded,
    new Date(block.date),
    categoryId // DB에 저장될 카테고리 ID
  );
}

// DTO→블록 (서버→클라이언트) 변환 함수 수정
export function convertScheduleToBlock(schedule: any): BlockType {
  // 로그 추가
  console.log("서버 데이터:", schedule);
  console.log(`카테고리 ID: ${schedule.scheduleCategoryId}`);

  const startedAt = new Date(schedule.startedAt ?? schedule.started_at);
  const endedAt = new Date(schedule.endedAt ?? schedule.ended_at);

  // UTC → KST 변환
  const startTimeKST = new Date(startedAt.getTime() + 9 * 60 * 60 * 1000);
  const endTimeKST = new Date(endedAt.getTime() + 9 * 60 * 60 * 1000);

  // 시간 추출
  const startHour = startTimeKST.getHours();
  const endHour = endTimeKST.getHours();

  // 카테고리 매핑 직접 처리
  let type: BlockType["type"];

  // 중요: 여기서 scheduleCategoryId 필드명과 매핑 확인
  if (schedule.scheduleCategoryId === 0) {
    type = "외근";
  } else if (schedule.scheduleCategoryId === 1) {
    type = "회의";
  } else if (schedule.scheduleCategoryId === 2) {
    type = "휴가";
  } else {
    // 기본값
    type = "외근";
  }

  console.log("매핑된 타입:", type);

  const color = COLOR_MAP[type];

  // 차트 범위 제한 (중요: 이 부분은 필요시에만 적용)
  let startTime = startHour;
  let endTime = endHour;

  // 차트 시간 범위 (9-19시) 내로 제한할 경우에만 아래 코드 사용
  // if (startTime > 19) startTime = 19;
  // if (startTime < 9) startTime = 9;
  // if (endTime > 19) endTime = 19;

  // duration 계산 (중요: +1 해야 제대로 표시됨)
  const duration = endTime - startTime + 1;

  return {
    id: schedule.id,
    date: (schedule.date ?? "").slice(0, 10),
    startTime: startHour,
    duration: endHour - startHour + 1 > 0 ? endHour - startHour + 1 : 1,
    type,
    color,
    expansionState: type !== "회의" ? 0 : undefined,
  };
}
