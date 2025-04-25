"use client";
import React, { useRef, useState, useEffect } from "react";
import { BlockType } from "@/types/ScheduleType";
import { useDrag } from "react-dnd";
import { toast } from "react-toastify";

interface BlockProps {
  block: BlockType;
  blocks: BlockType[];
  startHour: number;
  onResize: (
    id: string,
    newDuration: number,
    newStartTime?: number,
    expansionState?: 0 | 1 | 2
  ) => boolean | void;
  onDelete: (id: string) => void;
  onMove?: (id: string, date: string, startTime: number) => void;
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

export default function Block({
  block,
  blocks,
  startHour,
  onResize,
  onDelete,
  onMove,
}: BlockProps) {
  const blockRef = useRef<HTMLDivElement>(null);
  const [isResizingActive, setIsResizingActive] = useState(false);

  const isResizing = useRef<null | "top" | "bottom">(null);
  const startY = useRef<number>(0);
  const startHeight = useRef<number>(0);

  const chartEndHour = 19;

  // ★★★ 드래그 오프셋 계산 추가 ★★★
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "block-instance",
    item: () => {
      const rect = blockRef.current?.getBoundingClientRect();
      return {
        id: block.id,
        date: block.date,
        startTime: block.startTime,
        duration: block.duration,
        dragOffsetY: rect ? rect.top : 0, // 블럭 상단 Y 좌표 저장
      };
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const handleResizeStart = (
    e: React.MouseEvent,
    direction: "top" | "bottom"
  ) => {
    e.stopPropagation();
    e.preventDefault();
    isResizing.current = direction;
    startY.current = e.clientY;
    setIsResizingActive(true);
    if (blockRef.current) {
      startHeight.current = blockRef.current.offsetHeight;
    }
    document.addEventListener("mousemove", handleResizing);
    document.addEventListener("mouseup", handleResizeEnd);
  };

  const handleResizing = (e: MouseEvent) => {
    if (!blockRef.current || !isResizing.current) return;
    const hourHeight = 60;
    const diffY = e.clientY - startY.current;

    let resizeResult: boolean | void = true;

    if (isResizing.current === "top") {
      let newStartTime = block.startTime + Math.round(diffY / hourHeight);
      let newDuration = block.duration - Math.round(diffY / hourHeight);
      if (newDuration < 1) {
        newStartTime = block.startTime + (block.duration - 1);
        newDuration = 1;
      }
      if (newStartTime < startHour) {
        newStartTime = startHour;
        newDuration = block.startTime + block.duration - startHour;
        if (newDuration < 1) newDuration = 1;
      }
      if (newStartTime + newDuration > chartEndHour) {
        newDuration = chartEndHour - newStartTime;
        if (newDuration < 1) newDuration = 1;
      }
      resizeResult = onResize(block.id, newDuration, newStartTime, 0);
    } else {
      let newDuration = Math.max(
        1,
        Math.floor((startHeight.current + diffY) / hourHeight)
      );
      if (block.startTime + newDuration > chartEndHour) {
        newDuration = chartEndHour - block.startTime;
        if (newDuration < 1) newDuration = 1;
      }
      resizeResult = onResize(block.id, newDuration, undefined, 0);
    }
    if (resizeResult === false) {
      handleResizeEnd();
    }
  };

  const handleResizeEnd = () => {
    isResizing.current = null;
    setIsResizingActive(false);
    document.removeEventListener("mousemove", handleResizing);
    document.removeEventListener("mouseup", handleResizeEnd);
  };

  const blockMargin = 2;
  const height = block.duration * 60 - blockMargin * 2;
  const top = (block.startTime - startHour) * 60 + blockMargin;

  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleResizing);
      document.removeEventListener("mouseup", handleResizeEnd);
    };
  }, []);

  const formatTime = (hour: number) => {
    const period = hour < 12 ? "오전" : "오후";
    const displayHour = hour === 12 ? 12 : hour % 12 || 12;
    return `${period} ${displayHour}`;
  };

  const handleDoubleClick = () => {
    if (block.type !== "휴가" && block.type !== "외근") return;

    const chartStartHour = startHour;
    const chartEndHour = 19;
    let newStartTime = block.startTime;
    let newDuration = block.duration;
    let nextExpansionState: 0 | 1 | 2 = block.expansionState ?? 0;

    // 현재 블럭과 같은 날짜의 다른 블럭만 추출
    const dayBlocks = blocks.filter(
      (b) => b.date === block.date && b.id !== block.id
    );

    // 1단계: 2칸 → 4칸 (가능한 위/아래로 확장)
    if (block.expansionState === 0 || block.expansionState === undefined) {
      // 위로 얼마나 비어있는지
      let up = 0;
      for (let i = 1; i <= 2; i++) {
        const testStart = block.startTime - i;
        if (
          testStart < chartStartHour ||
          isOverlapping(dayBlocks, block.date, testStart, block.duration)
        )
          break;
        up++;
      }
      // 아래로 얼마나 비어있는지
      let down = 0;
      for (let i = 1; i <= 2; i++) {
        const testStart = block.startTime + i;
        if (
          testStart + block.duration - 1 >= chartEndHour ||
          isOverlapping(
            dayBlocks,
            block.date,
            block.startTime + down + 1,
            block.duration
          )
        )
          break;
        down++;
      }
      // 최대 2칸까지 위/아래로 확장
      let addUp = Math.min(2, up);
      let addDown = Math.min(2 - addUp, down);
      newStartTime = block.startTime - addUp;
      newDuration = block.duration + addUp + addDown;
      nextExpansionState = 1;
    }
    // 2단계: 4칸 → 위/아래 최대 확장
    else if (block.expansionState === 1) {
      // 위로
      let up = 0;
      for (let i = 1; block.startTime - i >= chartStartHour; i++) {
        if (
          isOverlapping(
            dayBlocks,
            block.date,
            block.startTime - i,
            block.duration
          )
        )
          break;
        up++;
      }
      // 아래로
      let down = 0;
      for (
        let i = 1;
        block.startTime + block.duration - 1 + i < chartEndHour;
        i++
      ) {
        if (
          isOverlapping(
            dayBlocks,
            block.date,
            block.startTime + down + 1,
            block.duration
          )
        )
          break;
        down++;
      }
      newStartTime = block.startTime - up;
      newDuration = block.duration + up + down;
      nextExpansionState = 2;
    }
    // 3단계: 전체 → 2칸(초기)
    else if (block.expansionState === 2) {
      newStartTime = Math.max(
        chartStartHour,
        Math.min(block.startTime, chartEndHour - 2)
      );
      newDuration = 2;
      nextExpansionState = 0;
    }

    // 최종 겹침 체크
    if (
      isOverlapping(blocks, block.date, newStartTime, newDuration, block.id)
    ) {
      toast.error("다른 일정이 있어 크기 변경이 불가합니다!");
      return;
    }

    onResize(block.id, newDuration, newStartTime, nextExpansionState);
  };
  return (
    <div
      ref={(el) => {
        blockRef.current = el;
        drag(el);
      }}
      className={`absolute left-2 right-2 rounded-lg overflow-hidden transition-all 
        ${
          isResizingActive ? "shadow-lg z-30" : "shadow-md hover:shadow-lg z-10"
        }`}
      style={{
        top: `${top + 4}px`,
        height: `${height - 8}px`,
        backgroundColor: block.color,
        transition: isResizingActive ? "none" : "all 0.2s ease",
        opacity: isDragging ? 0.5 : 1,
      }}
      onDoubleClick={handleDoubleClick}
    >
      {/* 상단 리사이즈 핸들 */}
      <div
        className="absolute top-0 left-0 right-0 h-3 cursor-ns-resize z-20 
          before:content-[''] before:absolute before:top-1 before:left-1/2 before:-translate-x-1/2 
          before:w-16 before:h-1 before:bg-white before:opacity-40 before:rounded-full 
          hover:bg-black hover:bg-opacity-10"
        onMouseDown={(e) => handleResizeStart(e, "top")}
      />
      {/* 블록 내용 */}
      <div className="flex flex-col justify-between h-full px-3 py-1">
        <div className="flex justify-between items-center">
          <span className="font-bold text-white truncate">{block.type}</span>
          <button
            className="text-white text-xl opacity-70 hover:opacity-100 transition-opacity"
            onClick={() => onDelete(block.id)}
          >
            ×
          </button>
        </div>
        <div className="text-white text-sm opacity-80">
          {formatTime(block.startTime)} -{" "}
          {formatTime(block.startTime + block.duration - 1)}
        </div>
      </div>
      {/* 하단 리사이즈 핸들 */}
      <div
        className="absolute bottom-0 left-0 right-0 h-3 cursor-ns-resize z-20
          before:content-[''] before:absolute before:bottom-1 before:left-1/2 before:-translate-x-1/2 
          before:w-16 before:h-1 before:bg-white before:opacity-40 before:rounded-full
          hover:bg-black hover:bg-opacity-10"
        onMouseDown={(e) => handleResizeStart(e, "bottom")}
      />
    </div>
  );
}
