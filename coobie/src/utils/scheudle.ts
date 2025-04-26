import { BlockType } from "@/types/ScheduleType";

// 일정 블록이 다른 블록과 겹치는지 확인하는 함수
export function isOverlapping(
  blocks: BlockType[], // 모든 블록 정보
  date: string, // 확인할 날짜
  startTime: number, // 확인할 시작 시간
  duration: number, // 확인할 지속 시간
  exceptBlockId?: string // 겹침 검사에서 제외할 블록 ID (자기 자신)
): boolean {
  const endTime = startTime + duration; // 확인할 블록의 종료 시간
  return blocks.some((block) => {
    if (block.date !== date) return false; // 날짜가 다르면 겹치지 않음
    if (block.id === exceptBlockId) return false; // 자기 자신은 겹침 검사에서 제외
    const blockEnd = block.startTime + block.duration; // 기존 블록의 종료 시간
    // // 시작 시간이 기존 블록의 종료 시간보다 작고, 종료 시간이 기존 블록의 시작 시간보다 크면 겹침
    return startTime < blockEnd && endTime > block.startTime;
  });
}
