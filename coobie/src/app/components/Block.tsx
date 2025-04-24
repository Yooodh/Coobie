"use client";
import React, { useRef, useState, useEffect } from "react";
import { BlockType } from "@/types/ScheduleType";
import { useDrag } from "react-dnd";

interface BlockProps {
  block: BlockType;
  startHour: number;
  onResize: (
    id: string,
    newDuration: number,
    newStartTime?: number
  ) => boolean | void;
  onDelete: (id: string) => void;
  onMove?: (id: string, date: string, startTime: number) => void;
}

export default function Block({
  block,
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

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "block-instance",
    item: {
      id: block.id,
      date: block.date,
      startTime: block.startTime,
      duration: block.duration,
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
      resizeResult = onResize(block.id, newDuration, newStartTime);
    } else {
      // 하단 리사이즈 - duration만 변경 (수정: Math.floor 사용)
      let newDuration = Math.max(
        1,
        Math.floor((startHeight.current + diffY) / hourHeight)
      );
      if (block.startTime + newDuration > chartEndHour) {
        newDuration = chartEndHour - block.startTime;
        if (newDuration < 1) newDuration = 1;
      }
      resizeResult = onResize(block.id, newDuration);
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
