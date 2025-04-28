"use client";
import React, { useRef, useState, useEffect } from "react";
import { BlockType } from "@/types/ScheduleType";
import { useDrag } from "react-dnd";
import { toast } from "react-toastify";
import { isOverlapping } from "@/utils/schedule";

interface BlockProps {
  block: BlockType; // 표시할 일정 블록의 정보
  blocks: BlockType[]; // 현재 날짜의 모든 일정 블록 정보
  startHour: number; // 스케줄 표의 시작 시간
  onResize: (
    id: number, // 변경할 블록의 ID
    newDuration: number, // 새로운 지속 시간 (시간 단위)
    newStartTime?: number, // 새로운 시작 시간 (시간 단위, 위로 리사이징 시 필요)
    expansionState?: 0 | 1 | 2 // 확장 상태
  ) => boolean | void; // 리사이징 성공 여부 또는 콜백 함수
  onDelete: (id: number) => void; // 삭제 콜백 함수
  onMove?: (id: number, date: string, startTime: number) => void; // 이동 콜백 함수 (드래그 앤 드롭)
  readOnly?: boolean;
}

// 실제 일정 블록 UI 컴포넌트
export default function Block({
  block,
  blocks,
  startHour,
  onResize,
  onDelete,
  onMove,
  readOnly = false,
}: BlockProps) {
  // 현재 블록의 DOM 엘리먼트에 대한 Ref
  const blockRef = useRef<HTMLDivElement>(null);
  // 리사이징 활성화 상태
  const [isResizingActive, setIsResizingActive] = useState(false);

  // 현재 리사이징 방향 ("top" 또는 "bottom")
  const isResizing = useRef<null | "top" | "bottom">(null);
  // 리사이징 시작 시 마우스 Y 좌표
  const startY = useRef<number>(0);
  // 리사이징 시작 시 블록의 높이
  const startHeight = useRef<number>(0);

  // 스케줄 표의 종료 시간 (예: 19시)
  const chartEndHour = 19;

  // 드래그 앤 드롭 기능 구현
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "block-instance", // 드래그 가능한 아이템의 타입 정의
    item: () => {
      // 드래그 시작 시 반환할 데이터
      const rect = blockRef.current?.getBoundingClientRect();
      return {
        id: block.id,
        date: block.date,
        startTime: block.startTime,
        duration: block.duration,
        dragOffsetY: rect ? rect.top : 0, // 블록 상단 Y 좌표 저장 (드래그 오프셋 계산에 사용)
      };
    },
    canDrag: !readOnly, // readOnly 시 드래그 비활성화
    collect: (monitor) => ({
      // 드래깅 상태를 감지하여 UI 업데이트에 사용
      isDragging: !!monitor.isDragging(),
    }),
  }));

  // 리사이징 시작 핸들러
  // 리사이즈 핸들러 비활성화
  const handleResizeStart = readOnly
    ? () => {}
    : (e: React.MouseEvent, direction: "top" | "bottom") => {
        if (readOnly) return; // 읽기 전용 모드면 리사이즈 금지
        e.stopPropagation(); // 이벤트 버블링 방지
        e.preventDefault(); // 기본 마우스 동작 방지
        isResizing.current = direction; // 현재 리사이징 방향 설정
        startY.current = e.clientY; // 시작 Y 좌표 저장
        setIsResizingActive(true); // 리사이징 활성화
        if (blockRef.current) {
          startHeight.current = blockRef.current.offsetHeight; // 시작 높이 저장
        }
        document.addEventListener("mousemove", handleResizing); // 마우스 이동 이벤트 리스너 등록 (리사이징 처리)
        document.addEventListener("mouseup", handleResizeEnd); // 마우스 업 이벤트 리스너 등록 (리사이징 종료)
      };

  // 리사이징 처리 핸들러 (마우스 이동 중)
  const handleResizing = (e: MouseEvent) => {
    if (!blockRef.current || !isResizing.current) return; // Ref가 없거나 리사이징 중이 아니면 종료
    const hourHeight = 60; // 시간당 높이 (픽셀)
    const diffY = e.clientY - startY.current; // 마우스 이동 거리 (Y축)

    let resizeResult: boolean | void = true; // 리사이징 결과 (성공/실패)

    // 위쪽 리사이징
    if (isResizing.current === "top") {
      let newStartTime = block.startTime + Math.round(diffY / hourHeight); // 새로운 시작 시간 계산
      let newDuration = block.duration - Math.round(diffY / hourHeight); // 새로운 지속 시간 계산
      // 최소 지속 시간 보장
      if (newDuration < 1) {
        newStartTime = block.startTime + (block.duration - 1);
        newDuration = 1;
      }
      // 시작 시간이 스케줄 표 시작 시간보다 작아지지 않도록 제한
      if (newStartTime < startHour) {
        newStartTime = startHour;
        newDuration = block.startTime + block.duration - startHour;
        if (newDuration < 1) newDuration = 1;
      }
      // 종료 시간이 스케줄 표 종료 시간보다 커지지 않도록 제한
      if (newStartTime + newDuration > chartEndHour) {
        newDuration = chartEndHour - newStartTime;
        if (newDuration < 1) newDuration = 1;
      }
      // onResize 콜백 호출
      resizeResult = onResize(block.id, newDuration, newStartTime, 0);
    }
    // 아래쪽 리사이징
    else {
      let newDuration = Math.max(
        1,
        Math.floor((startHeight.current + diffY) / hourHeight) // 새로운 지속 시간 계산
      );
      // 종료 시간이 스케줄 표 종료 시간보다 커지지 않도록 제한
      if (block.startTime + newDuration > chartEndHour) {
        newDuration = chartEndHour - block.startTime;
        if (newDuration < 1) newDuration = 1;
      }
      // onResize 콜백 호출
      resizeResult = onResize(block.id, newDuration, undefined, 0);
    }
    // 리사이징 실패 시 종료
    if (resizeResult === false) {
      handleResizeEnd();
    }
  };

  // 리사이징 종료 핸들러 (마우스 업)
  const handleResizeEnd = () => {
    isResizing.current = null; // 리사이징 상태 초기화
    setIsResizingActive(false); // 리사이징 비활성화
    document.removeEventListener("mousemove", handleResizing); // 마우스 이동 이벤트 리스너 제거
    document.removeEventListener("mouseup", handleResizeEnd); // 마우스 업 이벤트 리스너 제거
  };

  // 블록 간의 마진
  const blockMargin = 2;
  // 블록의 높이 (지속 시간 * 시간당 높이 - 마진)
  const height = block.duration * 60 - blockMargin * 2;
  // 블록의 top 위치 (시작 시간 - 스케줄 표 시작 시간) * 시간당 높이 + 마진
  const top = (block.startTime - startHour) * 60 + blockMargin;

  // 컴포넌트 언마운트 시 이벤트 리스너 제거
  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleResizing);
      document.removeEventListener("mouseup", handleResizeEnd);
    };
  }, []);

  // 시간을 오전/오후 형식으로 변환하는 함수
  const formatTime = (hour: number) => {
    const period = hour < 12 ? "오전" : "오후";
    const displayHour = hour === 12 ? 12 : hour % 12 || 12;
    return `${period} ${displayHour}`;
  };

  // 블록 더블 클릭 핸들러 (확장 기능)
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

    console.log(`Current expansion state: ${nextExpansionState}`);

    // 1단계 → 2단계 (2칸 → 4칸)
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
    }
    // 2단계 → 3단계 (4칸 → 전체 확장)
    else if (nextExpansionState === 1) {
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
    }
    // 3단계 → 1단계 (전체 → 2칸)
    else {
      newStartTime = Math.max(
        chartStartHour,
        Math.min(block.startTime, chartEndHour - 2)
      );
      newDuration = 2;
      nextExpansionState = 0;
    }

    // 최종 검증
    if (
      isOverlapping(blocks, block.date, newStartTime, newDuration, block.id)
    ) {
      toast.error("다른 일정이 있어 확장할 수 없습니다!");
      return;
    }

    console.log(`New expansion state: ${nextExpansionState}`);
    onResize(block.id, newDuration, newStartTime, nextExpansionState);
  };

  return (
    <div
      ref={(el) => {
        blockRef.current = el;
        drag(el); // drag 함수를 DOM 엘리먼트에 연결하여 드래그 가능하게 만듦
      }}
      className={`absolute left-2 right-2 rounded-lg overflow-hidden transition-all 
        ${
          isResizingActive ? "shadow-lg z-30" : "shadow-md hover:shadow-lg z-10"
        }`}
      style={{
        top: `${top + 4}px`, // 마진을 고려한 top 위치
        height: `${height - 8}px`, // 마진을 고려한 height
        backgroundColor: block.color, // 블록 색상
        transition: isResizingActive ? "none" : "all 0.2s ease", // 리사이징 중에는 transition 비활성화
        opacity: isDragging ? 0.5 : 1, // 드래깅 중 투명도 조절
        cursor: readOnly ? "default" : "grab", // 커서 스타일 변경
      }}
      onDoubleClick={readOnly ? undefined : handleDoubleClick} // 더블클릭 비활성화
    >
      {/* 상단 리사이즈 핸들 (읽기 전용 시 숨김) */}
      {!readOnly && (
        <div
          className="absolute top-0 left-0 right-0 h-3 cursor-ns-resize z-20 
            before:content-[''] before:absolute before:top-1 before:left-1/2 before:-translate-x-1/2 
            before:w-16 before:h-1 before:bg-white before:opacity-40 before:rounded-full 
            hover:bg-black hover:bg-opacity-10"
          onMouseDown={(e) => handleResizeStart(e, "top")}
        />
      )}
      {/* 블록 내용 */}
      <div className="flex flex-col justify-between h-full px-3 py-1">
        <div className="flex justify-between items-center">
          <span className="font-bold text-white truncate">{block.type}</span>
          {/* 삭제 버튼 (읽기 전용 시 숨김) */}
          {!readOnly && (
            <button
              className="text-white text-xl opacity-70 hover:opacity-100 transition-opacity"
              onClick={() => onDelete(block.id)}
            >
              ×
            </button>
          )}
        </div>
        <div className="text-white text-sm opacity-80">
          {formatTime(block.startTime)} -{" "}
          {formatTime(block.startTime + block.duration - 1)}
        </div>
      </div>

      {/* 하단 리사이즈 핸들 (읽기 전용 시 숨김) */}
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
