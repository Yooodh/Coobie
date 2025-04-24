"use client";
import React, { useRef, useEffect } from "react";
import BlockContainer from "./BlockContainer";
import { BlockType } from "@/types/ScheduleType";
import { useDrop } from "react-dnd";
import { toast } from "react-toastify";

interface ChartProps {
  blocks: BlockType[];
  onResizeBlock: (
    id: string,
    newDuration: number,
    newStartTime?: number
  ) => void;
  onDeleteBlock: (id: string) => void;
  date: Date;
  startHour: number;
  onAddBlock?: (
    type: "휴가" | "외근" | "회의",
    date: string,
    startTime: number
  ) => void;
  onMoveBlock?: (id: string, date: string, startTime: number) => void;
}

// 겹침 감지 함수 간소화
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

  const dateString = `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  // drop 함수를 미리 정의 (this.drop 오류 해결)
  const handleDrop = (item: any, monitor: any) => {
    const clientOffset = monitor.getClientOffset();
    if (!clientOffset || !dropRef.current) return;

    const hoverBoundingRect = dropRef.current.getBoundingClientRect();
    const hoverY = clientOffset.y - hoverBoundingRect.top;
    const hourHeight = 60;
    const dropHour = Math.floor(hoverY / hourHeight);
    const dropStartTime = Math.max(startHour, startHour + dropHour);

    // 겹침 체크 간소화
    let duration = 1;
    let exceptBlockId = undefined;

    if (item.duration) duration = item.duration;
    if (item.id) exceptBlockId = item.id;

    // 겹침 체크 - 같은 날짜의 블록만 필터링
    const sameDate = blocks.filter((block) => block.date === dateString);
    const overlap = isOverlapping(
      sameDate, // 중요: 전체 blocks가 아닌 현재 날짜의 blocks만 체크
      dateString,
      dropStartTime,
      duration,
      exceptBlockId
    );

    if (overlap) {
      toast.error("이미 블럭이 존재하는 시간대입니다!");
      return;
    }

    // e.stopPropagation() 추가 - 이벤트 전파 방지
    if (item.type && ["휴가", "외근", "회의"].includes(item.type)) {
      onAddBlock?.(item.type, dateString, dropStartTime);
    } else if (item.id && onMoveBlock) {
      onMoveBlock(item.id, dateString, dropStartTime);
    }
  };

  const [{ isOver }, drop] = useDrop({
    accept: ["block", "block-instance"],
    drop: handleDrop, // 미리 정의한 함수 사용
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

  return (
    <div
      className={`border border-gray-200 w-full h-full transition-colors duration-200 
        ${isOver ? "bg-blue-100 border-blue-300" : "bg-white"}`}
    >
      <div className="text-center p-2 border-b border-gray-200 text-lg font-medium text-gray-400">
        {formatDate(date)}
      </div>
      <div ref={combineRefs} className="relative h-[620px] overflow-y-auto">
        {timeLabels.map((hour, index) => (
          <div
            key={hour}
            className="absolute w-full h-[60px] border-t border-gray-200 flex items-center"
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
