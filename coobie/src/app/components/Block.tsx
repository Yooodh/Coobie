"use client";
import React, { useRef, useState, useEffect } from "react";
import { BlockType } from "@/types/ScheduleType";
import { useDrag } from "react-dnd";
import { toast } from "react-toastify";
import { isOverlapping } from "@/utils/schedule";

interface BlockProps {
  block: BlockType;
  blocks: BlockType[];
  startHour: number;
  onResize: (
    id: number,
    newDuration: number,
    newStartTime?: number,
    expansionState?: 0 | 1 | 2
  ) => boolean | void;
  onDelete: (id: number) => void;
  onMove?: (id: number, date: string, startTime: number) => void;
  readOnly?: boolean;
}

export default function Block({
  block,
  blocks,
  startHour,
  onResize,
  onDelete,
  onMove,
  readOnly = false,
}: BlockProps) {
  const blockRef = useRef<HTMLDivElement>(null);
  const [isResizingActive, setIsResizingActive] = useState(false);

  const isResizing = useRef<null | "top" | "bottom">(null);
  const startY = useRef<number>(0);
  const startHeight = useRef<number>(0);

  const chartEndHour = 19;

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "block-instance",
    item: () => {
      const rect = blockRef.current?.getBoundingClientRect();
      return {
        id: block.id,
        date: block.date,
        startTime: block.startTime,
        duration: block.duration,
        dragOffsetY: rect ? rect.top : 0,
      };
    },
    canDrag: !readOnly,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const handleResizeStart = readOnly
    ? () => {}
    : (e: React.MouseEvent, direction: "top" | "bottom") => {
        if (readOnly) return;
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
    if (readOnly) return;

    const chartStartHour = startHour;
    let newStartTime = block.startTime;
    let newDuration = block.duration;
    let nextExpansionState: 0 | 1 | 2 = block.expansionState ?? 0;

    const dayBlocks = blocks.filter(
      (b) => b.date === block.date && b.id !== block.id
    );

    if (nextExpansionState === 0) {
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

      let down = 0;
      for (let i = 1; i <= 2; i++) {
        const testStart = block.startTime + i;
        if (
          testStart + block.duration - 1 >= chartEndHour ||
          isOverlapping(dayBlocks, block.date, testStart, block.duration)
        )
          break;
        down++;
      }

      newStartTime = block.startTime - up;
      newDuration = block.duration + up + down;
      nextExpansionState = 1;
    } else if (nextExpansionState === 1) {
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

      let down = 0;
      for (
        let i = 1;
        block.startTime + block.duration + i - 1 < chartEndHour;
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
    } else {
      newStartTime = Math.max(
        chartStartHour,
        Math.min(block.startTime, chartEndHour - 2)
      );
      newDuration = 2;
      nextExpansionState = 0;
    }

    if (
      isOverlapping(blocks, block.date, newStartTime, newDuration, block.id)
    ) {
      toast.error("다른 일정이 있어 확장할 수 없습니다!");
      return;
    }

    onResize(block.id, newDuration, newStartTime, nextExpansionState);
  };

  console.log("Block readOnly:", readOnly);

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
        cursor: readOnly ? "default" : "grab",
      }}
      onDoubleClick={readOnly ? undefined : handleDoubleClick}
    >
      {/* 상단 리사이즈 핸들 */}
      {!readOnly && (
        <div
          className="absolute top-0 left-0 right-0 h-3 cursor-ns-resize z-20 
            before:content-[''] before:absolute before:top-1 before:left-1/2 before:-translate-x-1/2 
            before:w-16 before:h-1 before:bg-white before:opacity-40 before:rounded-full 
            hover:bg-black hover:bg-opacity-10"
          onMouseDown={(e) => handleResizeStart(e, "top")}
        />
      )}

      {/* 삭제 버튼: 오른쪽 상단 */}
      {!readOnly && (
        <button
          className="absolute top-3 right-3 p-1 rounded-full bg-black/20 hover:bg-black/40 transition-transform duration-150 cursor-pointer z-30 hover:scale-125"
          onClick={() => onDelete(block.id)}
          aria-label="삭제"
          type="button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M10 3h4a1 1 0 011 1v2H9V4a1 1 0 011-1z"
            />
          </svg>
        </button>
      )}

      {/* 블록 내용: 중앙 정렬 */}
      <div className="flex flex-col items-center justify-center h-full px-2 py-1 select-none">
        <span className="font-bold text-white text-base text-center mb-1 ">
          {block.type}
        </span>
        <span className="text-white text-xs opacity-90 text-center">
          {formatTime(block.startTime)} -{" "}
          {formatTime(block.startTime + block.duration - 1)}
        </span>
      </div>

      {/* 하단 리사이즈 핸들 */}
      {!readOnly && (
        <div
          className="absolute bottom-0 left-0 right-0 h-3 cursor-ns-resize z-20
            before:content-[''] before:absolute before:bottom-1 before:left-1/2 before:-translate-x-1/2 
            before:w-16 before:h-1 before:bg-white before:opacity-40 before:rounded-full
            hover:bg-black hover:bg-opacity-10"
          onMouseDown={(e) => handleResizeStart(e, "bottom")}
        />
      )}
    </div>
  );
}
