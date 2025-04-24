"use client";
import React, { useState } from "react";
import ProfileContainer from "@/app/components/ProfileContainer";
import ChartContainer from "@/app/components/ChartContainer";
import DraggableBlock from "@/app/components/DraggableBlock";
import { BlockType, ProfileType } from "@/types/ScheduleType";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Home() {
  // 차트의 시작 시간(오전 9시)
  const [startHour] = useState(9);
  // 모든 일정 블록 상태 관리
  const [blocks, setBlocks] = useState<BlockType[]>([]);

  // 사용자 프로필 정보 상태 관리
  const [profile] = useState<ProfileType>({
    name: "유대현",
    title: "FE Developer",
    company: "멋사",
    avatar: "/placeholder-avatar.jpg",
  });

  // 일정 블록이 겹치는지 검사하는 함수
  function isOverlapping(
    blocks: BlockType[],
    day: number,
    startTime: number,
    duration: number,
    exceptBlockId?: string // (옵션) 검사에서 제외할 블록 id
  ) {
    const endTime = startTime + duration;
    return blocks.some((block) => {
      if (block.day !== day) return false; // 같은 요일만 검사
      if (block.id === exceptBlockId) return false; // 자기 자신 제외
      const blockEnd = block.startTime + block.duration;
      // 시간이 겹치는지 검사
      return startTime < blockEnd && endTime > block.startTime;
    });
  }

  // 새로운 일정 블록 추가 핸들러
  const handleAddBlock = (
    type: "휴가" | "외근" | "회의",
    day: number,
    startTime: number
  ) => {
    const duration = 1; // 기본 1시간
    const endTime = startTime + duration;

    // 허용 시간 범위(9~19시) 체크
    if (startTime < startHour || endTime > 19) {
      setTimeout(() => toast.error("허용된 시간 범위를 벗어났습니다!"), 0);
      return;
    }

    // 시간 겹침 체크
    const isOverlap = blocks.some((block) => {
      if (block.day !== day) return false;
      const blockEnd = block.startTime + block.duration;
      return startTime < blockEnd && endTime > block.startTime;
    });

    if (isOverlap) {
      setTimeout(() => toast.error("시간이 겹치는 일정이 있습니다!"), 0);
      return;
    }

    // 타입별 색상 지정
    const colors = {
      휴가: "#F7B299",
      외근: "#7EDC92",
      회의: "#7EC6F7",
    };

    // 새 블록 객체 생성
    const newBlock: BlockType = {
      id: `${Date.now()}-${Math.random()}`,
      day,
      startTime,
      duration,
      type,
      color: colors[type],
    };

    // 블록 추가 및 성공 토스트
    setBlocks((prev) => [...prev, newBlock]);
    setTimeout(() => toast.success("일정이 추가되었습니다!"), 0);
  };

  // 블록 크기(기간) 조절 핸들러
  const handleResizeBlock = (
    id: string,
    newDuration: number,
    newStartTime?: number
  ) => {
    let overlap = false;
    setBlocks((prevBlocks) =>
      prevBlocks.map((block) => {
        if (block.id !== id) return block;
        const startTime = newStartTime ?? block.startTime;
        const endTime = startTime + newDuration;

        // 겹치는 블록이 있는지 검사
        const isOverlap = prevBlocks.some((b) => {
          if (b.id === id || b.day !== block.day) return false;
          const bEnd = b.startTime + b.duration;
          return startTime < bEnd && endTime > b.startTime;
        });

        if (isOverlap) {
          overlap = true;
          return block;
        }
        // 크기/시작시간 변경
        return { ...block, duration: newDuration, startTime };
      })
    );

    if (overlap) {
      setTimeout(() => toast.error("시간이 겹치는 일정이 있습니다!"), 0);
      return false;
    }
    return true;
  };

  // 블록 이동 핸들러 (다른 요일/시간으로 이동)
  const handleMoveBlock = (
    id: string,
    newDay: number,
    newStartTime: number
  ) => {
    let overlap = false;
    setBlocks((prevBlocks) =>
      prevBlocks.map((block) => {
        if (block.id !== id) return block;
        const endTime = newStartTime + block.duration;

        // 겹치는 블록이 있는지 검사
        const isOverlap = prevBlocks.some((b) => {
          if (b.id === id || b.day !== newDay) return false;
          const bEnd = b.startTime + b.duration;
          return newStartTime < bEnd && endTime > b.startTime;
        });

        if (isOverlap) {
          overlap = true;
          return block;
        }
        // 요일/시작시간 변경
        return { ...block, day: newDay, startTime: newStartTime };
      })
    );
    if (overlap) {
      setTimeout(() => toast.error("시간이 겹치는 일정이 있습니다!"), 0);
      return false;
    }
    return true;
  };

  // 블록 삭제 핸들러
  const handleDeleteBlock = (id: string) => {
    setBlocks((prevBlocks) => prevBlocks.filter((block) => block.id !== id));
    setTimeout(() => toast.info("일정이 삭제되었습니다!"), 0);
  };

  // 일정 데이터 저장(로컬스토리지)
  const handleSave = () => {
    localStorage.setItem("blocks", JSON.stringify(blocks));
    setTimeout(() => toast.success("일정이 저장되었습니다!"), 0);
  };

  // 컴포넌트 렌더링
  return (
    <main className="container mx-auto p-6 min-h-screen">
      {/* 토스트 메시지 컨테이너 */}
      <ToastContainer position="top-center" autoClose={2000} />
      {/* 상단: 프로필 및 블록 팔레트 */}
      <div className="flex justify-between items-start mb-8">
        {/* 프로필 영역 */}
        <div className="min-w-[320px]">
          <ProfileContainer profile={profile} />
        </div>
        {/* 블록 팔레트(휴가/외근/회의) */}
        <div className="flex flex-col items-end gap-6 flex-1">
          <div className="flex space-x-6">
            <DraggableBlock type="휴가" color="#F7B299" />
            <DraggableBlock type="외근" color="#7EDC92" />
            <DraggableBlock type="회의" color="#7EC6F7" />
          </div>
        </div>
      </div>

      {/* 주간/월간 차트 컨테이너 */}
      <ChartContainer
        blocks={blocks}
        onResizeBlock={handleResizeBlock}
        onDeleteBlock={handleDeleteBlock}
        startHour={startHour}
        onAddBlock={handleAddBlock}
        onMoveBlock={handleMoveBlock}
      />

      {/* 저장 버튼 */}
      <button
        onClick={handleSave}
        className="fixed bottom-8 right-8 bg-blue-500 hover:bg-blue-600 text-white text-lg font-bold px-8 py-2 rounded-lg shadow-lg transition-all z-50"
      >
        저장
      </button>
    </main>
  );
}
