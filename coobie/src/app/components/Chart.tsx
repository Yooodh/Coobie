"use client";

import React, { useRef } from "react";
import BlockContainer from "./BlockContainer";
import { BlockType } from "@/types/ScheduleType";
import { useDrop } from "react-dnd";
import { toast } from "react-toastify";
import { isOverlapping } from "@/utils/schedule";

interface ChartProps {
  blocks: BlockType[];
  readOnly?: boolean;
  onResizeBlock: (
    id: number,
    newDuration: number,
    newStartTime?: number,
    expansionState?: 0 | 1 | 2
  ) => void;
  onDeleteBlock: (id: number) => void;
  date: Date;
  startHour: number;
  onAddBlock?: (
    type: "휴가" | "외근" | "회의",
    date: string,
    startTime: number
  ) => void;
  onMoveBlock?: (
    id: number,
    date: string,
    startTime: number,
    duration?: number
  ) => void;
}

const Chart: React.FC<ChartProps> = ({
  blocks,
  onResizeBlock,
  onDeleteBlock,
  date,
  startHour,
  onAddBlock,
  onMoveBlock,
  readOnly = false,
}) => {
  const dropRef = useRef<HTMLDivElement>(null);

  // 드롭 핸들러
  const handleDrop = (item: any, monitor: any) => {
    if (readOnly) return; // 읽기 전용 모드면 동작 중지
    const clientOffset = monitor.getClientOffset();
    if (!clientOffset || !dropRef.current) return;

    // 날짜 포맷
    const dateString = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

    // 드래그 시작 위치와 드래그 원본 위치 차이 계산
    const initialClientOffset = monitor.getInitialClientOffset();
    const initialSourceClientOffset = monitor.getInitialSourceClientOffset();
    const dragOffsetY =
      initialClientOffset && initialSourceClientOffset
        ? initialClientOffset.y - initialSourceClientOffset.y
        : 0;

    // 드롭 위치 계산
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

    // 같은 날짜 블록만 필터링
    const sameDate = (blocks || []).filter(
      (block) => block.date === dateString
    );

    // 겹침 체크
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

    // 새 블록 추가 또는 기존 블록 이동
    if (item.type && ["휴가", "외근", "회의"].includes(item.type)) {
      onAddBlock?.(item.type, dateString, dropStartTime); // Optional chaining 사용
    } else if (item.id && onMoveBlock) {
      onMoveBlock(item.id, dateString, dropStartTime);
    }
  };

  // useDrop 훅
  const [{ isOver }, drop] = useDrop({
    accept: ["block", "block-instance"],
    drop: handleDrop,
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  // 시간 라벨
  const timeLabels = Array.from({ length: 10 }, (_, i) => startHour + i);

  // 날짜 포맷 (ex: 04.26(금))
  const formatDate = (date: Date) => {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const weekDays = ["일", "월", "화", "수", "목", "금", "토"];
    const weekDay = weekDays[date.getDay()];
    return `${month}.${day}(${weekDay})`;
  };

  // ref 합성
  const combineRefs = (el: HTMLDivElement | null) => {
    drop(el);
    dropRef.current = el;
  };

  // 현재 날짜를 YYYY-MM-DD 포맷으로 변환
  const dateString = `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  // 리사이즈 핸들러 비활성화
  const handleResize = readOnly ? () => {} : onResizeBlock;
  const handleDelete = readOnly ? () => {} : onDeleteBlock;

  return (
    <div
      className={`border border-gray-200 w-full h-full transition-colors duration-200 
        ${isOver ? "bg-blue-100 border-blue-300" : "bg-white"}`}
    >
      {/* 상단 날짜 표시 */}
      <div className="text-center p-2 border-b border-gray-200 text-lg font-medium text-white select-none bg-[#edba60]">
        {formatDate(date)}
      </div>

      {/* 차트 영역 */}
      <div
        ref={combineRefs}
        className="relative overflow-hidden"
        style={{ height: `${timeLabels.length * 60}px` }}
      >
        {/* 시간 라인 */}
        {timeLabels.map((hour, index) => (
          <div
            key={hour}
            className={`absolute w-full h-[60px] border-t border-gray-200 flex items-center select-none"
              ${
                index === timeLabels.length - 1
                  ? "border-b border-gray-200"
                  : ""
              }`}
            style={{ top: `${index * 60}px` }}
          >
            <span className="text-sm pl-2 text-gray-400 select-none font-medium">
              {hour < 12
                ? `오전 ${hour}`
                : `오후 ${hour === 12 ? 12 : hour - 12}`}{" "}
            </span>
          </div>
        ))}

        {/* 블록 컨테이너 */}
        <BlockContainer
          blocks={blocks}
          date={dateString}
          startHour={startHour}
          onResizeBlock={handleResize}
          onDeleteBlock={handleDelete}
          onMoveBlock={onMoveBlock}
        />
      </div>
    </div>
  );
};

export default Chart;
