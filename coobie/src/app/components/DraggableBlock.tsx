"use client";
import { useDrag } from "react-dnd";

interface DraggableBlockProps {
  type: "휴가" | "외근" | "회의"; // 블록의 종류
  color: string; // 블록의 배경색
}

// 드래그 가능한 블록 컴포넌트 정의
export default function DraggableBlock({ type, color }: DraggableBlockProps) {
  // useDrag 훅으로 드래그 상태 및 ref 생성
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "block", // 드래그 타입 지정 (드롭 영역에서 이 타입을 허용해야 함)
    item: { type, color }, // 드래그 시 전달할 데이터
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(), // 드래그 중 여부를 상태로 수집
    }),
  }));

  // 버튼(블록) 렌더링
  return (
    <button
      ref={drag} // 드래그 ref 연결
      style={{
        backgroundColor: color, // 배경색 지정
        opacity: isDragging ? 0.5 : 1, // 드래그 중에는 투명도 낮춤
        transform: isDragging ? "scale(1.05)" : "scale(1)", // 드래그 중에는 크기 약간 확대
        boxShadow: isDragging
          ? "0 10px 15px rgba(0,0,0,0.2)" // 드래그 중에는 그림자 강조
          : "0 2px 5px rgba(0,0,0,0.1)", // 평소에는 약한 그림자
        transition: "transform 0.1s, box-shadow 0.1s, opacity 0.1s",
      }}
      className="w-32 h-24 text-2xl font-bold text-white rounded-xl cursor-grab active:cursor-grabbing"
    >
      {type} {/* 블록의 종류(휴가/외근/회의) 텍스트로 표시 */}
    </button>
  );
}
