import React, { useRef, useState } from "react";
import Chart from "./Chart";
import { BlockType } from "@/types/ScheduleType";
import { Swiper, SwiperSlide, SwiperRef } from "swiper/react";
import "swiper/css";

// 월요일~일요일로 주간 배열 생성
function getMonthWeeks(year: number, month: number) {
  const firstDate = new Date(year, month, 1);
  const lastDate = new Date(year, month + 1, 0);

  // 첫 주의 월요일
  const firstDayOfWeek = firstDate.getDay();
  const start =
    firstDayOfWeek === 1
      ? new Date(firstDate)
      : new Date(
          firstDate.getFullYear(),
          firstDate.getMonth(),
          firstDate.getDate() - ((firstDayOfWeek + 6) % 7)
        );
  // 마지막 주의 일요일
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
  blocks: BlockType[];
  onResizeBlock: (
    id: string,
    newDuration: number,
    newStartTime?: number
  ) => void;
  onDeleteBlock: (id: string) => void;
  startHour: number;
  onAddBlock: (
    type: "휴가" | "외근" | "회의",
    date: string,
    startTime: number
  ) => void;
  onMoveBlock?: (id: string, date: string, startTime: number) => void;
}

const ChartContainer: React.FC<ChartContainerProps> = ({
  blocks,
  onResizeBlock,
  onDeleteBlock,
  startHour,
  onAddBlock,
  onMoveBlock,
}) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const weeks = getMonthWeeks(year, month);

  // 오늘이 포함된 주 인덱스
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
    return 0;
  };

  const [currentIndex, setCurrentIndex] = useState(getCurrentWeekIndex());
  const swiperRef = useRef<SwiperRef>(null);

  // 좌우 이동
  const handlePrev = () => {
    swiperRef.current?.swiper.slidePrev();
  };
  const handleNext = () => {
    swiperRef.current?.swiper.slideNext();
  };

  // 이번주로 이동
  const handleGoToThisWeek = () => {
    const idx = getCurrentWeekIndex();
    setCurrentIndex(idx);
    swiperRef.current?.swiper.slideTo(idx);
  };

  return (
    <div className="relative w-full">
      {/* 이번주로 버튼 */}
      <button
        onClick={handleGoToThisWeek}
        className="absolute right-44 top-0 z-20 bg-gray-200 text-gray-800 rounded px-4 py-2"
      >
        이번주로
      </button>
      {/* 좌우 화살표 */}
      <button
        onClick={handlePrev}
        className="fixed left-0 top-1/2 -translate-y-1/2 z-10  bg-red-100 text-red-600 rounded-full w-10 h-10 flex items-center justify-center shadow"
      >
        {"<"}
      </button>
      <button
        onClick={handleNext}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-10 bg-blue-100 text-blue-600 rounded-full w-10 h-10 flex items-center justify-center shadow"
      >
        {">"}
      </button>
      <Swiper
        ref={swiperRef}
        slidesPerView={1}
        allowTouchMove={false}
        simulateTouch={false}
        onSlideChange={(swiper) => setCurrentIndex(swiper.activeIndex)}
        initialSlide={currentIndex}
        className="px-12"
      >
        {weeks.map((weekDates, idx) => (
          <SwiperSlide key={idx}>
            <div className="grid grid-cols-7 gap-px h-[640px] border border-gray-200 bg-gray-100 pointer-events-auto">
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
