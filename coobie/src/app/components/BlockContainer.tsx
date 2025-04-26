"use client";
import React from "react";
import Block from "./Block";
import { BlockType } from "@/types/ScheduleType";

interface BlockContainerProps {
  blocks: BlockType[]; // 전체 블록 리스트
  date: string; // 현재 날짜 (YYYY-MM-DD)
  startHour: number; // 차트의 시작 시간
  onResizeBlock: (
    id: number,
    newDuration: number,
    newStartTime?: number,
    expansionState?: 0 | 1 | 2
  ) => void; // 블록 리사이즈 이벤트 핸들러
  onDeleteBlock: (id: number) => void; // 블록 삭제 이벤트 핸들러
  onMoveBlock?: (id: number, date: string, startTime: number) => void; // 블록 이동 이벤트 핸들러 (선택적)
}

// BlockContainer 컴포넌트 정의
const BlockContainer: React.FC<BlockContainerProps> = ({
  blocks = [],
  date,
  startHour,
  onResizeBlock,
  onDeleteBlock,
  onMoveBlock,
}) => {
  const CHART_START = 9;
  const CHART_END = 22;
  const dayBlocks = blocks.filter((block) => {
    // 날짜 형식 통일을 위해 포매팅
    const blockDate = block.date.slice(0, 10);
    const currentDate = date;

    console.log(
      "블록 날짜:",
      blockDate,
      "현재 날짜:",
      currentDate,
      "일치여부:",
      blockDate === currentDate
    );

    if (blockDate !== currentDate) return false;

    // 시간 범위 체크는 유지
    const blockEnd = block.startTime + block.duration - 1;
    const visible = block.startTime <= CHART_END && blockEnd >= CHART_START;

    console.log(
      "블록:",
      block.id,
      "표시여부:",
      visible,
      "시작시간:",
      block.startTime,
      "차트범위:",
      CHART_START,
      "-",
      CHART_END
    );

    return visible;
  });

  return (
    <div className="relative h-full w-full">
      {/* 필터링된 블록들을 Block 컴포넌트로 렌더링 */}
      {dayBlocks.map((block) => (
        <Block
          key={block.id}
          block={block}
          blocks={blocks} // 전체 blocks도 하위 컴포넌트에 전달
          startHour={startHour} // 차트 시작 시간
          onResize={onResizeBlock} // 블록 리사이즈 핸들러 전달
          onDelete={onDeleteBlock} // 블록 삭제 핸들러 전달
          onMove={onMoveBlock} // 블록 이동 핸들러 전달 (optional)
        />
      ))}
    </div>
  );
};

export default BlockContainer;
