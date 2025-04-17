// 클라이언트 컴포넌트로 선언 (Next.js 전용)
"use client";

import { useRef } from "react";
import { useDrop } from "react-dnd"; // 드롭 기능 제공 훅
import DataBlock, { Schedule } from "./DataBlock";

// 컴포넌트에 전달될 props 타입 정의
type DataChartProps = {
  chartData: Schedule[]; // 차트에 표시될 스케줄 목록
  onDropSchedule: (schedule: Schedule) => void; // 드롭 시 호출될 콜백 함수
  onRemoveSchedule: (scheduleId: number) => void; // 스케줄 제거 시 호출될 콜백 함수
};

export default function DataChart({
  chartData,
  onDropSchedule,
  onRemoveSchedule,
}: DataChartProps) {
  // 드롭 영역을 참조하기 위한 ref 생성
  const ref = useRef<HTMLDivElement>(null);

  // 드롭 영역 설정 - useDrop 훅 사용
  const [{ isOver }, drop] = useDrop({
    // 드롭 가능한 아이템 타입 지정
    accept: "SCHEDULE",

    // 아이템이 드롭되었을 때 실행되는 콜백
    drop: (item: { schedule: Schedule }) => {
      onDropSchedule(item.schedule); // 부모 컴포넌트에서 전달받은 함수 호출
      return {}; // 필수는 아니지만 반환 값 명시
    },

    // 현재 드래그 중인 아이템이 이 영역 위에 있는지 확인
    collect: (monitor) => ({
      isOver: monitor.isOver(), // 영역 위에 있을 경우 true
    }),
  });

  // 생성한 ref에 드롭 기능 연결
  drop(ref);

  return (
    <div
      ref={ref} // 드롭 영역 지정
      style={{
        minHeight: 200, // 최소 높이 설정
        background: isOver ? "#444" : "#333", // 드래그 중일 때 색 변경
        border: "2px dashed #888", // 테두리 스타일
        borderRadius: "8px", // 테두리 둥글게
        margin: "16px 0", // 위아래 여백
        padding: "16px", // 내부 여백
        transition: "background 0.2s", // 배경색 부드럽게 전환
      }}
    >
      {/* 드롭 영역 제목 */}
      <h2
        style={{
          fontSize: "1.5rem",
          marginBottom: "1rem",
          textAlign: "center",
          color: "#fff",
        }}
      >
        차트 드롭 영역
      </h2>

      {/* 차트 데이터가 없을 경우 안내 메시지 표시 */}
      {chartData.length === 0 ? (
        <div style={{ textAlign: "center", color: "#fff", padding: "20px" }}>
          여기로 DataBlock을 드래그하세요!
        </div>
      ) : (
        // 차트에 있는 스케줄 목록 렌더링
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {chartData.map((schedule) => (
            <DataBlock
              key={schedule.id} // 고유 키 설정
              schedule={schedule} // 개별 스케줄 전달
              isInChart={true} // 차트 안에 있는 상태임을 표시 (스타일 분기 가능)
              onRemoveFromChart={() => onRemoveSchedule(schedule.id)} // 삭제 버튼 누르면 호출
            />
          ))}
        </div>
      )}
    </div>
  );
}
