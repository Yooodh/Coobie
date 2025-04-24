"use client";
import React from "react";
import Chart from "./Chart";
import { BlockType } from "@/types/ScheduleType";

interface ChartContainerProps {
  blocks: BlockType[]; // 모든 일정 블록 데이터 배열
  onResizeBlock: (
    id: string,
    newDuration: number,
    newStartTime?: number
  ) => void; // 블록 크기 조절 함수 (id, 새 기간, 새 시작 시간)
  onDeleteBlock: (id: string) => void; // 블록 삭제 함수 (id)
  startHour: number; // 차트의 시작 시간 (예: 9시)
  onAddBlock: (
    type: "휴가" | "외근" | "회의",
    day: number,
    startTime: number
  ) => void; // 블록 추가 함수 (타입, 요일, 시작 시간)
  onMoveBlock?: (id: string, day: number, startTime: number) => void; // 블록 이동 함수 (id, 새 요일, 새 시작 시간) - 선택적
}

// ChartContainer 컴포넌트
const ChartContainer: React.FC<ChartContainerProps> = ({
  blocks,
  onResizeBlock,
  onDeleteBlock,
  startHour,
  onAddBlock,
  onMoveBlock, // 블록 이동 함수
}) => {
  // 현재 날짜 기준 주간 날짜 배열 생성
  const today = new Date(); // 현재 날짜 객체 생성
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today); // 오늘 날짜 복사
    const currentDay = today.getDay(); // 현재 요일 (0: 일요일, 1: 월요일, ...)
    const dayDiff = i - (currentDay === 0 ? 6 : currentDay - 1); // 월요일 기준으로 날짜 차이 계산
    // (currentDay가 0(일요일)이면 6을, 아니면 currentDay-1을 i에서 뺌)
    date.setDate(today.getDate() + dayDiff); // 계산된 차이만큼 날짜 조정
    return date; // 새 날짜 객체 반환
  });

  // 컴포넌트 렌더링
  return (
    <div className="w-full">
      {/* 7열 그리드로 주간 차트 레이아웃 생성 */}
      <div className="grid grid-cols-7 gap-px h-[640px] border border-gray-200">
        {/* 각 날짜별로 Chart 컴포넌트 렌더링 */}
        {weekDates.map((date, index) => (
          <Chart
            key={index} // React 리스트의 고유 키
            blocks={blocks} // 모든 블록 데이터 전달
            onResizeBlock={onResizeBlock} // 블록 크기 조절 함수 전달
            onDeleteBlock={onDeleteBlock} // 블록 삭제 함수 전달
            day={index} // 요일 인덱스 (0-6)
            date={date} // 날짜 객체
            startHour={startHour} // 시작 시간
            onAddBlock={onAddBlock} // 블록 추가 함수 전달
            onMoveBlock={onMoveBlock} // 블록 이동 함수 전달
          />
        ))}
      </div>
    </div>
  );
};

export default ChartContainer;
