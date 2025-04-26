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
  // 현재 날짜(date)에 해당하는 블록만 필터링
  const dayBlocks = Array.isArray(blocks)
    ? blocks.filter((block) => block.date === date)
    : [];

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
