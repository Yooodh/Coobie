"use client";
import React from "react";
import Block from "./Block";
import { BlockType } from "@/types/ScheduleType";

interface BlockContainerProps {
  blocks: BlockType[];
  date: string;
  startHour: number;
  onResizeBlock: (
    id: string,
    newDuration: number,
    newStartTime?: number,
    expansionState?: 0 | 1 | 2
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
  const dayBlocks = blocks.filter((block) => block.date === date);

  return (
    <div className="relative h-full w-full">
      {dayBlocks.map((block) => (
        <Block
          key={block.id}
          block={block}
          blocks={blocks} // blocks prop 전달 추가
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
