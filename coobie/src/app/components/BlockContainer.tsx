"use client";
import React from "react";
import Block from "./Block";
import { BlockType } from "@/types/ScheduleType";

interface BlockContainerProps {
  blocks: BlockType[];
  date: string; // YYYY-MM-DD (변경)
  startHour: number;
  onResizeBlock: (
    id: string,
    newDuration: number,
    newStartTime?: number
  ) => void;
  onDeleteBlock: (id: string) => void;
  onMoveBlock?: (id: string, date: string, startTime: number) => void;
}

const BlockContainer: React.FC<BlockContainerProps> = ({
  blocks,
  date,
  startHour,
  onResizeBlock,
  onDeleteBlock,
  onMoveBlock,
}) => {
  // 날짜(date) 기준으로 필터링
  const dayBlocks = blocks.filter((block) => block.date === date);

  return (
    <div className="relative h-full w-full">
      {dayBlocks.map((block) => (
        <Block
          key={block.id}
          block={block}
          startHour={startHour}
          onResize={onResizeBlock}
          onDelete={onDeleteBlock}
          onMove={onMoveBlock}
        />
      ))}
    </div>
  );
};

export default BlockContainer;
