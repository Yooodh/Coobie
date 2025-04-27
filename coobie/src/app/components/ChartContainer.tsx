"use client";
import React, { useRef, useState } from "react";
import Chart from "./Chart";
import { BlockType } from "@/types/ScheduleType";
import { Swiper, SwiperSlide, SwiperRef } from "swiper/react";
import "swiper/css";

// 월별 주간 배열 생성 (월~일 기준)
function getMonthWeeks(year: number, month: number) {
  const firstDate = new Date(year, month, 1); // 해당 월의 첫째 날
  const lastDate = new Date(year, month + 1, 0); // 해당 월의 마지막 날

  // 첫 주의 월요일로 이동
  const firstDayOfWeek = firstDate.getDay();
  const start =
    firstDayOfWeek === 1
      ? new Date(firstDate)
      : new Date(
          firstDate.getFullYear(),
          firstDate.getMonth(),
          firstDate.getDate() - ((firstDayOfWeek + 6) % 7)
        );

  // 마지막 주의 일요일로 이동
  const lastDayOfWeek = lastDate.getDay();
  const end =
    lastDayOfWeek === 0
      ? new Date(lastDate)
      : new Date(
          lastDate.getFullYear(),
          lastDate.getMonth(),
          lastDate.getDate() + (7 - lastDayOfWeek)
        );

  const weeks: Date[][] = [];
  let current = new Date(start);

  // 주 단위로 날짜를 끊어서 배열 생성
  while (current <= end) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    weeks.push(week);
  }

  return weeks;
}

interface ChartContainerProps {
  blocks: BlockType[]; // 블럭 데이터
  onResizeBlock: (
    id: number,
    newDuration: number,
    newStartTime?: number
  ) => void; // 블럭 크기 조정
  onDeleteBlock: (id: number) => void; // 블럭 삭제
  startHour: number; // 차트 시작 시간 (ex: 9시)
  readOnly?: boolean; // 추가
  onAddBlock?: (
    type: "휴가" | "외근" | "회의",
    date: string,
    startTime: number
  ) => void; // 블럭 추가
  onMoveBlock?: (id: number, date: string, startTime: number) => void; // 블럭 이동 (옵션)
}

// 메인 컴포넌트
const ChartContainer: React.FC<ChartContainerProps> = ({
  blocks,
  onResizeBlock,
  onDeleteBlock,
  startHour,
  onAddBlock,
  onMoveBlock,
  readOnly = false, // 기본값 false
}) => {
  const today = new Date(); // 오늘 날짜
  const year = today.getFullYear();
  const month = today.getMonth();
  const weeks = getMonthWeeks(year, month); // 이번 달 주간 배열 가져오기

  // 오늘이 포함된 주 인덱스 구하기
  const getCurrentWeekIndex = () => {
    for (let i = 0; i < weeks.length; i++) {
      if (
        weeks[i].some(
          (d) =>
            d.getFullYear() === today.getFullYear() &&
            d.getMonth() === today.getMonth() &&
            d.getDate() === today.getDate()
        )
      ) {
        return i;
      }
    }
    return 0; // 못 찾으면 0 (안전장치)
  };

  const [currentIndex, setCurrentIndex] = useState(getCurrentWeekIndex()); // 현재 보고 있는 주
  const swiperRef = useRef<SwiperRef>(null); // 스와이퍼 제어를 위한 ref

  // 이전 주로 이동
  const handlePrev = () => {
    swiperRef.current?.swiper.slidePrev();
  };

  // 다음 주로 이동
  const handleNext = () => {
    swiperRef.current?.swiper.slideNext();
  };

  // 이번 주로 이동
  const handleGoToThisWeek = () => {
    const idx = getCurrentWeekIndex();
    setCurrentIndex(idx);
    swiperRef.current?.swiper.slideTo(idx);
  };

  return (
    <div className="relative w-full">
      {/* '이번주' 버튼 */}
      <button
        onClick={handleGoToThisWeek}
        className="fixed right-8 bottom-24 z-50 bg-gray-200 text-gray-800 rounded px-4 py-2 shadow"
      >
        이번주
      </button>

      {/* 이전 주 버튼 */}
      <button
        aria-label="이전 주"
        onClick={handlePrev}
        className="fixed left-8 top-1/2 bottom-24 z-50 flex items-center justify-center w-10 h-10 rounded-full bg-white shadow hover:bg-blue-100 hover:scale-110 transition-all duration-150 focus:outline-none"
      >
        <svg
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* 다음 주 버튼 */}
      <button
        aria-label="다음 주"
        onClick={handleNext}
        className="fixed right-8 top-1/2 z-50 flex items-center justify-center w-10 h-10 rounded-full bg-white shadow hover:bg-blue-100 hover:scale-110 transition-all duration-150 focus:outline-none"
      >
        <svg
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="9 6 15 12 9 18" />
        </svg>
      </button>

      {/* 주간 차트를 Swiper로 슬라이드로 보여줌  */}
      <Swiper
        ref={swiperRef}
        slidesPerView={1}
        allowTouchMove={false} // 손가락 스와이프 비활성화 (버튼으로만 이동)
        simulateTouch={false}
        onSlideChange={(swiper) => setCurrentIndex(swiper.activeIndex)}
        initialSlide={currentIndex}
        className="px-12"
      >
        {weeks.map((weekDates, idx) => (
          <SwiperSlide key={idx}>
            <div className="grid grid-cols-7 gap-px h-[647px] border border-gray-200 bg-gray-100 pointer-events-auto">
              {weekDates.map((date) => (
                <Chart
                  key={date.toISOString()}
                  blocks={blocks}
                  onResizeBlock={onResizeBlock}
                  onDeleteBlock={onDeleteBlock}
                  date={date}
                  startHour={startHour}
                  onAddBlock={onAddBlock}
                  onMoveBlock={onMoveBlock}
                  readOnly={readOnly} // 기본값 false
                />
              ))}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ChartContainer;
