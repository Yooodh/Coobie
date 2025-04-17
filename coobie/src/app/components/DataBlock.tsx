// 클라이언트 컴포넌트로 지정 (Next.js에서 브라우저 동작 허용)
"use client";

import { useRef, useState, useEffect } from "react";
import { useDrag } from "react-dnd";

// 스케줄 데이터 타입 정의
export type Schedule = {
  id: number;
  userId: string;
  startAt: string;
  date: string;
  deletedAt: string | null;
  scheduleCategoryId: number;
};

// 컴포넌트에 전달될 props 타입 정의
type DataBlockProps = {
  schedule: Schedule; // 스케줄 데이터
  isInChart?: boolean; // 차트 내에 존재 여부 (기본값: false)
  onRemoveFromChart?: () => void; // 차트에서 제거할 때 호출할 함수
};

export default function DataBlock({
  schedule,
  isInChart = false,
  onRemoveFromChart,
}: DataBlockProps) {
  // 박스 DOM을 참조하기 위한 ref
  const ref = useRef<HTMLDivElement>(null);

  // 박스의 세로 높이 상태
  const [height, setHeight] = useState(200); // 기본 높이: 200px

  // 리사이징 상태 관련 변수들
  const [isResizing, setIsResizing] = useState(false); // 현재 리사이징 중인지
  const [resizeStartY, setResizeStartY] = useState(0); // 리사이징 시작 시 Y 좌표
  const [resizeStartHeight, setResizeStartHeight] = useState(0); // 시작 높이
  const [resizeEdge, setResizeEdge] = useState<"top" | "bottom" | null>(null); // 리사이징 시작 방향

  // useDrag 훅으로 드래그 가능하도록 설정
  const [{ isDragging }, drag] = useDrag({
    type: "SCHEDULE", // 드래그 아이템 타입
    item: { schedule }, // 드래그 중 전달할 데이터
    canDrag: !isInChart && !isResizing, // 차트 내에 있거나 리사이징 중일 때는 드래그 불가능
    collect: (monitor) => ({
      isDragging: monitor.isDragging(), // 드래그 중 여부 수집
    }),
  });

  // 리사이징 시작 처리 함수
  const handleResizeStart = (e: React.MouseEvent, edge: "top" | "bottom") => {
    e.stopPropagation(); // 이벤트 버블링 방지
    setIsResizing(true); // 리사이징 시작
    setResizeStartY(e.clientY); // 마우스 시작 위치 저장
    setResizeStartHeight(height); // 기존 높이 저장
    setResizeEdge(edge); // 시작된 엣지 저장
  };

  // 리사이징 중 이벤트 처리 (mousemove, mouseup)
  useEffect(() => {
    const handleResizeMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const deltaY = e.clientY - resizeStartY; // 마우스 이동 거리 계산

      if (resizeEdge === "bottom") {
        // 아래로 드래그 시 높이 증가
        setHeight(Math.max(100, resizeStartHeight + deltaY));
      } else if (resizeEdge === "top") {
        // 위로 드래그 시 높이 감소
        setHeight(Math.max(100, resizeStartHeight - deltaY));
      }
    };

    const handleResizeEnd = () => {
      setIsResizing(false); // 리사이징 종료
      setResizeEdge(null); // 방향 초기화
    };

    if (isResizing) {
      // 리사이징 중이면 이벤트 리스너 추가
      window.addEventListener("mousemove", handleResizeMove);
      window.addEventListener("mouseup", handleResizeEnd);
    }

    // 정리 함수: 이벤트 리스너 제거
    return () => {
      window.removeEventListener("mousemove", handleResizeMove);
      window.removeEventListener("mouseup", handleResizeEnd);
    };
  }, [isResizing, resizeStartY, resizeStartHeight, resizeEdge]);

  // ref 요소에 drag 기능 연결
  drag(ref);

  return (
    <div
      ref={ref} // DOM 요소 참조 및 drag 대상 지정
      style={{
        opacity: isDragging ? 0.5 : 1, // 드래그 중 투명도 조절
        border: "1px solid #444", // 테두리
        padding: "16px", // 내부 여백
        margin: "8px", // 외부 여백
        background: isInChart ? "#333" : "#222", // 차트 내 여부에 따라 배경색 구분
        color: "#fff", // 글자색
        borderRadius: "8px", // 모서리 둥글게
        cursor: isResizing
          ? resizeEdge === "top"
            ? "n-resize"
            : "s-resize"
          : isInChart
          ? "default"
          : "grab", // 상태에 따라 커서 변경
        width: 220, // 고정 너비
        height: `${height}px`, // 동적 높이
        position: "relative", // 내부 요소 위치 지정용
        overflow: "auto", // 내부 내용 스크롤 가능
      }}
    >
      {/* 상단 리사이즈 핸들 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "8px",
          cursor: "n-resize",
          backgroundColor: "transparent", // 보이지 않지만 커서로 조작 가능
        }}
        onMouseDown={(e) => handleResizeStart(e, "top")}
      />

      {/* 하단 리사이즈 핸들 */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "8px",
          cursor: "s-resize",
          backgroundColor: "transparent",
        }}
        onMouseDown={(e) => handleResizeStart(e, "bottom")}
      />

      {/* 차트 내부일 때만 삭제 버튼 표시 */}
      {isInChart && onRemoveFromChart && (
        <button
          onClick={onRemoveFromChart}
          style={{
            position: "absolute",
            top: 5,
            right: 5,
            background: "#f44336",
            color: "white",
            border: "none",
            borderRadius: "50%",
            width: 20,
            height: 20,
            fontSize: 12,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
        >
          ×
        </button>
      )}

      {/* 스케줄 정보 출력 */}
      <div style={{ marginTop: "10px" }}>
        <b>ID:</b> {schedule.id}
      </div>
      <div>
        <b>사용자:</b> {schedule.userId}
      </div>
      <div>
        <b>시작:</b> {schedule.startAt}
      </div>
      <div>
        <b>날짜:</b> {schedule.date}
      </div>
      <div>
        <b>카테고리:</b> {schedule.scheduleCategoryId}
      </div>
    </div>
  );
}
