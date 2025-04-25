"use client";
import React, { useRef } from "react";
import { BlockType } from "@/types/ScheduleType";
import { useDrop } from "react-dnd";
import BlockContainer from "./BlockContainer";
import { toast } from "react-toastify";

interface ChartProps {
  blocks: BlockType[];
  onResizeBlock: (
    id: string,
    newDuration: number,
    newStartTime?: number,
    expansionState?: 0 | 1 | 2
  ) => void;
  onDeleteBlock: (id: string) => void;
  date: Date;
  startHour: number;
  onAddBlock?: (
    type: "휴가" | "외근" | "회의",
    date: string,
    startTime: number
  ) => void;
  onMoveBlock?: (
    id: string,
    date: string,
    startTime: number,
    duration?: number
  ) => void;
}

function isOverlapping(
  blocks: BlockType[],
  date: string,
  startTime: number,
  duration: number,
  exceptBlockId?: string
) {
  const endTime = startTime + duration;
  return blocks.some((block) => {
    if (block.date !== date) return false;
    if (block.id === exceptBlockId) return false;
    const blockEnd = block.startTime + block.duration;
    return startTime < blockEnd && endTime > block.startTime;
  });
}

const Chart: React.FC<ChartProps> = ({
  blocks,
  onResizeBlock,
  onDeleteBlock,
  date,
  startHour,
  onAddBlock,
  onMoveBlock,
}) => {
  const dropRef = useRef<HTMLDivElement>(null);

  const handleDrop = (item: any, monitor: any) => {
    const clientOffset = monitor.getClientOffset();
    if (!clientOffset || !dropRef.current) return;

    const dateString = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

    const initialClientOffset = monitor.getInitialClientOffset();
    const initialSourceClientOffset = monitor.getInitialSourceClientOffset();
    const dragOffsetY =
      initialClientOffset && initialSourceClientOffset
        ? initialClientOffset.y - initialSourceClientOffset.y
        : 0;

    const blockTopPosition = clientOffset.y - dragOffsetY;
    const hoverBoundingRect = dropRef.current.getBoundingClientRect();
    const hoverY = blockTopPosition - hoverBoundingRect.top;

    const hourHeight = 60;
    const dropHour = Math.floor(hoverY / hourHeight);
    let dropStartTime = Math.max(startHour, startHour + dropHour);

    let duration = 1;
    let exceptBlockId = undefined;

    if (item.duration) duration = item.duration;
    if (item.id) exceptBlockId = item.id;

    const chartEndHour = 19;

    if (dropStartTime + duration > chartEndHour) {
      dropStartTime = chartEndHour - duration;
      if (dropStartTime < startHour) {
        toast.error("차트에 공간이 부족해 이동할 수 없습니다!");
        return;
      }
    }

    const sameDate = blocks.filter((block) => block.date === dateString);
    const overlap = isOverlapping(
      sameDate,
      dateString,
      dropStartTime,
      duration,
      exceptBlockId
    );

    if (overlap) {
      toast.error("이미 블럭이 존재하는 시간대입니다!");
      return;
    }

    if (item.type && ["휴가", "외근", "회의"].includes(item.type)) {
      onAddBlock?.(item.type, dateString, dropStartTime);
    } else if (item.id && onMoveBlock) {
      onMoveBlock(item.id, dateString, dropStartTime);
    }
  };

  const [{ isOver }, drop] = useDrop({
    accept: ["block", "block-instance"],
    drop: handleDrop,
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  const timeLabels = Array.from({ length: 10 }, (_, i) => startHour + i);

  const formatDate = (date: Date) => {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const weekDays = ["일", "월", "화", "수", "목", "금", "토"];
    const weekDay = weekDays[date.getDay()];
    return `${month}.${day}(${weekDay})`;
  };

  const combineRefs = (el: HTMLDivElement | null) => {
    drop(el);
    dropRef.current = el;
  };

  const dateString = `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  return (
    <div
      className={`border border-gray-200 w-full h-full transition-colors duration-200 
        ${isOver ? "bg-blue-100 border-blue-300" : "bg-white"}`}
    >
      <div className="text-center p-2 border-b border-gray-200 text-lg font-medium text-gray-400">
        {formatDate(date)}
      </div>
      <div
        ref={combineRefs}
        className="relative overflow-hidden"
        style={{ height: `${timeLabels.length * 60}px` }}
      >
        {timeLabels.map((hour, index) => (
          <div
            key={hour}
            className={`absolute w-full h-[60px] border-t border-gray-200 flex items-center
              ${
                index === timeLabels.length - 1
                  ? "border-b border-gray-200"
                  : ""
              }`}
            style={{ top: `${index * 60}px` }}
          >
            <span className="text-sm pl-2 text-gray-400">
              {hour < 12
                ? `오전 ${hour}`
                : `오후 ${hour === 12 ? 12 : hour - 12}`}{" "}
            </span>
          </div>
        ))}
        <BlockContainer
          blocks={blocks}
          date={dateString}
          startHour={startHour}
          onResizeBlock={onResizeBlock}
          onDeleteBlock={onDeleteBlock}
          onMoveBlock={onMoveBlock}
        />
      </div>
    </div>
  );
};

export default Chart;
