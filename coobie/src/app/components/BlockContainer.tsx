"use client";
import React from "react";
import Block from "./Block";
import { BlockType } from "@/types/ScheduleType";

interface BlockContainerProps {
  blocks: BlockType[]; // 모든 일정 블록 데이터 배열
  day: number; // 현재 표시할 요일/날짜 인덱스
  startHour: number; // 차트의 시작 시간
  onResizeBlock: (
    id: string,
    newDuration: number,
    newStartTime?: number
  ) => void; // 블록 크기 조절 시 호출되는 함수
  onDeleteBlock: (id: string) => void; // 블록 삭제 시 호출되는 함수
  onMoveBlock?: (id: string, day: number, startTime: number) => void; // 블록 이동 시 호출되는 함수 (선택적)
}

// BlockContainer 컴포넌트 구현
const BlockContainer: React.FC<BlockContainerProps> = ({
  blocks,
  day,
  startHour,
  onResizeBlock,
  onDeleteBlock,
  onMoveBlock, // 추가된 블록 이동 핸들러
}) => {
  // 현재 day에 해당하는 블록만 필터링
  const dayBlocks = blocks.filter((block) => block.day === day);

  // 컨테이너와 필터링된 블록들 렌더링
  return (
    <div className="relative h-full w-full">
      {/* 현재 날짜의 모든 블록을 매핑하여 렌더링 */}
      {dayBlocks.map((block) => (
        <Block
          key={block.id} // React의 리스트 렌더링을 위한 고유 키
          block={block} // 블록 데이터 전달
          startHour={startHour} // 시작 시간 전달
          onResize={onResizeBlock} // 크기 조절 콜백 전달
          onDelete={onDeleteBlock} // 삭제 콜백 전달
          onMove={onMoveBlock} // 이동 콜백 전달
        />
      ))}
    </div>
  );
};

export default BlockContainer;
