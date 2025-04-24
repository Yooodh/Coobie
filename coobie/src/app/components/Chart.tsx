"use client";
import React, { useRef } from "react";
import BlockContainer from "./BlockContainer";
import { BlockType } from "@/types/ScheduleType";
import { useDrop } from "react-dnd";

interface ChartProps {
  blocks: BlockType[]; // 모든 일정 블록 데이터 배열
  onResizeBlock: (
    id: string,
    newDuration: number,
    newStartTime?: number
  ) => void; // 블록 크기 조절 시 호출되는 함수
  onDeleteBlock: (id: string) => void; // 블록 삭제 시 호출되는 함수
  day: number; // 현재 표시할 요일/날짜 인덱스
  date: Date; // 현재 날짜 객체
  startHour: number; // 차트의 시작 시간 (예: 9시)
  onAddBlock?: (
    type: "휴가" | "외근" | "회의",
    day: number,
    startTime: number
  ) => void; // 블록 추가 시 호출되는 함수 (선택적)
  onMoveBlock?: (id: string, day: number, startTime: number) => void; // 블록 이동 시 호출되는 함수 (선택적)
}

// 차트 컴포넌트 구현
const Chart: React.FC<ChartProps> = ({
  blocks,
  onResizeBlock,
  onDeleteBlock,
  day,
  date,
  startHour,
  onAddBlock,
  onMoveBlock,
}) => {
  const dropRef = useRef<HTMLDivElement>(null); // 드롭 영역의 DOM 요소 참조 저장

  // --- React DnD 드롭 영역 설정 ---
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ["block", "block-instance"], // 수락할 드래그 타입 (팔레트의 블록과 이미 있는 블록 인스턴스)
    drop: (item: any, monitor) => {
      // 드롭 이벤트 발생 시 처리 로직
      const clientOffset = monitor.getClientOffset(); // 마우스 커서 위치 가져오기
      if (!clientOffset || !dropRef.current) {
        return; // 위치 정보나 참조가 없으면 중단
      }
      const hoverBoundingRect = dropRef.current.getBoundingClientRect(); // 드롭 영역의 위치와 크기 정보
      const hoverY = clientOffset.y - hoverBoundingRect.top; // 드롭 영역 내 상대적 Y 위치
      const hourHeight = 60; // 1시간의 픽셀 높이
      const dropHour = Math.floor(hoverY / hourHeight); // 드롭된 시간 계산 (몇 번째 시간 블록인지)
      const dropStartTime = Math.max(startHour, startHour + dropHour); // 시작 시간 계산 및 최소값 보장

      if (item.type && ["휴가", "외근", "회의"].includes(item.type)) {
        // 블록 팔레트에서 드래그한 경우 (새 블록 추가)
        onAddBlock?.(item.type, day, dropStartTime);
      } else if (item.id && onMoveBlock) {
        // 이미 있는 블록을 드래그하여 이동한 경우
        onMoveBlock(item.id, day, dropStartTime);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(), // 드래그 요소가 드롭 영역 위에 있는지 여부
    }),
  }));
  // ----------------------

  // 시간 레이블 배열 생성 (startHour부터 9개 시간)
  const timeLabels = Array.from({ length: 10 }, (_, i) => startHour + i);

  // 날짜 포맷 함수 (MM.DD(요일) 형식으로 변환)
  const formatDate = (date: Date) => {
    const month = String(date.getMonth() + 1).padStart(2, "0"); // 월 (01-12)
    const day = String(date.getDate()).padStart(2, "0"); // 일 (01-31)
    const weekDays = ["일", "월", "화", "수", "목", "금", "토"]; // 요일 문자열 배열
    const weekDay = weekDays[date.getDay()]; // 해당 날짜의 요일 문자열
    return `${month}.${day}(${weekDay})`; // "MM.DD(요일)" 형식으로 반환
  };

  // React DnD ref와 일반 ref를 함께 사용하기 위한 함수
  const combineRefs = (el: HTMLDivElement | null) => {
    drop(el); // React DnD의 drop ref 설정
    dropRef.current = el; // 일반 useRef 설정
  };

  // 차트 렌더링
  return (
    <div
      className={`border border-gray-200 w-full h-full transition-colors duration-200 
        ${isOver ? "bg-blue-100 border-blue-300" : "bg-white"}`} // 드래그 요소가 위에 있을 때 배경색 변경
    >
      {/* 날짜 헤더 */}
      <div className="text-center p-2 border-b border-gray-200 text-lg font-medium text-gray-400">
        {formatDate(date)} {/* MM.DD(요일) 형식의 날짜 표시 */}
      </div>
      {/* 차트 본문 영역 (시간 레이블 + 블록 컨테이너) */}
      <div ref={combineRefs} className="relative h-[600px]">
        {/* 시간 레이블 (세로 눈금선) */}
        {timeLabels.map((hour, index) => (
          <div
            key={hour}
            className="absolute w-full h-[60px] border-t border-gray-200 flex items-center"
            style={{ top: `${index * 60}px` }} // 각 시간마다 60px 간격으로 배치
          >
            <span className="text-sm pl-2 text-gray-400">
              {hour < 12
                ? `오전 ${hour}`
                : `오후 ${hour === 12 ? 12 : hour - 12}`}{" "}
            </span>
          </div>
        ))}
        {/* 블록 컨테이너 - 실제 일정 블록들을 표시 */}
        <BlockContainer
          blocks={blocks} // 모든 블록 데이터
          day={day} // 현재 날짜 인덱스
          startHour={startHour} // 시작 시간
          onResizeBlock={onResizeBlock} // 크기 조절 콜백
          onDeleteBlock={onDeleteBlock} // 삭제 콜백
          onMoveBlock={onMoveBlock} // 이동 콜백
        />
      </div>
    </div>
  );
};

export default Chart;
