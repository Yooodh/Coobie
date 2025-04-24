"use client";
import React, { useRef, useState, useEffect } from "react";
import { BlockType } from "@/types/ScheduleType";
import { useDrag } from "react-dnd";

interface BlockProps {
  block: BlockType; // 블록 데이터 (id, day, startTime, duration 등)
  startHour: number; // 차트의 시작 시간
  onResize: (
    id: string,
    newDuration: number,
    newStartTime?: number
  ) => boolean | void; // 블록 크기 조절 시 호출되는 함수
  onDelete: (id: string) => void; // 블록 삭제 시 호출되는 함수
  onMove?: (id: string, day: number, startTime: number) => void; // 블록 이동 시 호출되는 함수
}

export default function Block({
  block,
  startHour,
  onResize,
  onDelete,
  onMove,
}: BlockProps) {
  // DOM 요소 참조 및 상태 관리
  const blockRef = useRef<HTMLDivElement>(null); // 블록 DOM 요소 참조
  const [isResizingActive, setIsResizingActive] = useState(false); // 리사이징 활성화 상태

  // 리사이징 관련 참조값 (렌더링에 영향 없는 값들)
  const isResizing = useRef<null | "top" | "bottom">(null); // 현재 리사이징 방향
  const startY = useRef<number>(0); // 리사이징 시작 시 마우스 Y 좌표
  const startHeight = useRef<number>(0); // 리사이징 시작 시 블록 높이

  const chartEndHour = 19; // 차트 종료 시간 설정 (19시)

  // React DnD 드래그 설정 - 블록을 드래그 가능하게 함
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "block-instance", // 드래그 타입 지정
    item: {
      // 드래그 시 전달할 데이터
      id: block.id,
      day: block.day,
      startTime: block.startTime,
      duration: block.duration,
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(), // 드래그 중인지 상태 수집
    }),
  }));

  // 리사이징 시작 핸들러 - 방향(top/bottom)에 따라 리사이징 시작
  const handleResizeStart = (
    e: React.MouseEvent,
    direction: "top" | "bottom"
  ) => {
    e.stopPropagation(); // 이벤트 버블링 방지
    e.preventDefault(); // 기본 동작 방지
    isResizing.current = direction; // 리사이징 방향 설정
    startY.current = e.clientY; // 시작 Y 좌표 저장
    setIsResizingActive(true); // 리사이징 활성 상태로 변경
    if (blockRef.current) {
      startHeight.current = blockRef.current.offsetHeight; // 시작 높이 저장
    }
    // 문서 레벨 이벤트 리스너 추가
    document.addEventListener("mousemove", handleResizing);
    document.addEventListener("mouseup", handleResizeEnd);
  };

  // 리사이징 중 핸들러 - 마우스 이동에 따라 블록 크기 조절
  const handleResizing = (e: MouseEvent) => {
    if (!blockRef.current || !isResizing.current) return;
    const hourHeight = 60; // 1시간의 픽셀 높이
    const diffY = e.clientY - startY.current; // Y 좌표 변화량

    let resizeResult: boolean | void = true;

    // 상단(top) 리사이징 - 시작 시간과 기간 모두 변경
    if (isResizing.current === "top") {
      let newStartTime = block.startTime + Math.round(diffY / hourHeight);
      let newDuration = block.duration - Math.round(diffY / hourHeight);

      // 최소 기간(1시간) 제한
      if (newDuration < 1) {
        newStartTime = block.startTime + (block.duration - 1);
        newDuration = 1;
      }
      // 시작 시간 제한 (차트 시작 시간보다 빠를 수 없음)
      if (newStartTime < startHour) {
        newStartTime = startHour;
        newDuration = block.startTime + block.duration - startHour;
        if (newDuration < 1) newDuration = 1;
      }

      // 종료 시간 제한 (차트 종료 시간보다 늦을 수 없음)
      if (newStartTime + newDuration > chartEndHour) {
        newDuration = chartEndHour - newStartTime;
        if (newDuration < 1) newDuration = 1;
      }

      // 리사이즈 콜백 호출 (시작 시간과 기간 모두 변경)
      resizeResult = onResize(block.id, newDuration, newStartTime);
    } else {
      // 하단(bottom) 리사이징 - 기간만 변경
      const adjustedDiffY = diffY + hourHeight / 2; // 반올림 조정을 위한 계산
      let newDuration = Math.max(
        1,
        Math.round((startHeight.current + adjustedDiffY) / hourHeight)
      );

      // 종료 시간 제한 (차트 종료 시간보다 늦을 수 없음)
      if (block.startTime + newDuration > chartEndHour) {
        newDuration = chartEndHour - block.startTime;
        if (newDuration < 1) newDuration = 1;
      }

      // 리사이즈 콜백 호출 (기간만 변경)
      resizeResult = onResize(block.id, newDuration);
    }

    // 리사이즈가 실패하면 리사이징 종료
    if (resizeResult === false) {
      handleResizeEnd();
    }
  };

  // 리사이징 종료 핸들러
  const handleResizeEnd = () => {
    isResizing.current = null; // 리사이징 방향 초기화
    setIsResizingActive(false); // 리사이징 비활성 상태로 변경
    // 문서 레벨 이벤트 리스너 제거
    document.removeEventListener("mousemove", handleResizing);
    document.removeEventListener("mouseup", handleResizeEnd);
  };

  // 블록 위치 및 크기 계산
  const blockMargin = 2; // 블록 여백
  const height = block.duration * 60 - blockMargin * 2; // 블록 높이 계산 (1시간 = 60px)
  const top = (block.startTime - startHour) * 60 + blockMargin; // 블록 상단 위치 계산

  // 컴포넌트 언마운트 시 이벤트 리스너 정리
  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleResizing);
      document.removeEventListener("mouseup", handleResizeEnd);
    };
  }, []);

  // 시간 포맷 변환 (24시간 → 오전/오후)
  const formatTime = (hour: number) => {
    const period = hour < 12 ? "오전" : "오후";
    const displayHour = hour === 12 ? 12 : hour % 12 || 12;
    return `${period} ${displayHour}`;
  };

  // 블록 렌더링
  return (
    <div
      ref={(el) => {
        blockRef.current = el; // React ref 설정
        drag(el); // React DnD 드래그 ref 연결
      }}
      className={`absolute left-2 right-2 rounded-lg overflow-hidden transition-all 
        ${
          isResizingActive ? "shadow-lg z-30" : "shadow-md hover:shadow-lg z-10"
        }`}
      style={{
        top: `${top + 4}px`, // 상단 위치 설정
        height: `${height - 8}px`, // 높이 설정
        backgroundColor: block.color, // 블록 색상
        transition: isResizingActive ? "none" : "all 0.2s ease", // 리사이징 중에는 transition 비활성화
        opacity: isDragging ? 0.5 : 1, // 드래그 중에는 투명도 조정
      }}
    >
      {/* 상단 리사이즈 핸들 - 드래그하여 시작 시간 조절 */}
      <div
        className="absolute top-0 left-0 right-0 h-3 cursor-ns-resize z-20 
          before:content-[''] before:absolute before:top-1 before:left-1/2 before:-translate-x-1/2 
          before:w-16 before:h-1 before:bg-white before:opacity-40 before:rounded-full 
          hover:bg-black hover:bg-opacity-10"
        onMouseDown={(e) => handleResizeStart(e, "top")}
      />
      {/* 블록 내용 - 제목 및 시간 */}
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
          {formatTime(block.startTime + block.duration)}
        </div>
      </div>
      {/* 하단 리사이즈 핸들 - 드래그하여 기간 조절 */}
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
