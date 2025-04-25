"use client";
import React, { useState } from "react";
import ProfileContainer from "@/app/components/ProfileContainer";
import ChartContainer from "@/app/components/ChartContainer";
import DraggableBlock from "@/app/components/DraggableBlock";
import { BlockType, ProfileType } from "@/types/ScheduleType";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// 날짜 형식 통일을 위한 유틸리티 함수
function formatDateString(date: string | Date): string {
  if (typeof date === "string") return date;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

// 겹침 체크 함수 개선
function isOverlapping(
  blocks: BlockType[],
  date: string | Date,
  startTime: number,
  duration: number,
  exceptBlockId?: string
) {
  const endTime = startTime + duration;
  const formattedDate = formatDateString(date);
  return blocks.some((block) => {
    if (formatDateString(block.date) !== formattedDate) return false;
    if (block.id === exceptBlockId) return false;
    const blockEnd = block.startTime + block.duration;
    return startTime < blockEnd && endTime > block.startTime;
  });
}

export default function Home() {
  const [startHour] = useState(9);
  const [blocks, setBlocks] = useState<BlockType[]>([]);
  const [profile] = useState<ProfileType>({
    name: "유대현",
    title: "FE Developer",
    company: "멋사",
    avatar: "/placeholder-avatar.jpg",
  });

  const handleAddBlock = (
    type: "휴가" | "외근" | "회의",
    date: string,
    startTime: number
  ) => {
    const duration = type === "회의" ? 1 : 2;
    const endTime = startTime + duration;

    if (startTime < startHour || endTime > 19) {
      toast.error("허용된 시간 범위를 벗어났습니다!");
      return;
    }

    const formattedDate = formatDateString(date);
    const isOverlap = blocks.some((block) => {
      if (formatDateString(block.date) !== formattedDate) return false;
      const blockEnd = block.startTime + block.duration;
      return startTime < blockEnd && endTime > block.startTime;
    });

    if (isOverlap) {
      toast.error("시간이 겹치는 일정이 있습니다!");
      return;
    }

    const colors = {
      휴가: "#F7B299",
      외근: "#7EDC92",
      회의: "#7EC6F7",
    };

    const newBlock: BlockType = {
      id: `${Date.now()}-${Math.random()}`,
      date: formattedDate,
      startTime,
      duration,
      type,
      color: colors[type],
      expansionState: type !== "회의" ? 0 : undefined,
    };

    setBlocks((prev) => [...prev, newBlock]);
    toast.success("일정이 추가되었습니다!");
  };

  const handleResizeBlock = (
    id: string,
    newDuration: number,
    newStartTime?: number,
    expansionState?: 0 | 1 | 2
  ) => {
    let overlap = false;
    setBlocks((prevBlocks) =>
      prevBlocks.map((block) => {
        if (block.id !== id) return block;
        const startTime = newStartTime ?? block.startTime;
        const endTime = startTime + newDuration;

        const isOverlap = prevBlocks.some((b) => {
          if (
            b.id === id ||
            formatDateString(b.date) !== formatDateString(block.date)
          )
            return false;
          const bEnd = b.startTime + b.duration;
          return startTime < bEnd && endTime > b.startTime;
        });

        if (isOverlap) {
          overlap = true;
          return block;
        }
        return {
          ...block,
          duration: newDuration,
          startTime,
          expansionState: expansionState ?? block.expansionState,
        };
      })
    );

    if (overlap) {
      toast.error("시간이 겹치는 일정이 있습니다!");
      return false;
    }
    return true;
  };

  const handleMoveBlock = (
    id: string,
    newDate: string | Date,
    newStartTime: number,
    newDuration?: number
  ) => {
    const formattedDate = formatDateString(newDate);
    let overlap = false;
    setBlocks((prevBlocks) =>
      prevBlocks.map((block) => {
        if (block.id !== id) return block;
        const duration = newDuration ?? block.duration;
        const endTime = newStartTime + duration;

        const isOverlap = prevBlocks.some((b) => {
          if (b.id === id || formatDateString(b.date) !== formattedDate)
            return false;
          const bEnd = b.startTime + b.duration;
          return newStartTime < bEnd && endTime > b.startTime;
        });

        if (isOverlap) {
          overlap = true;
          return block;
        }
        return {
          ...block,
          date: formattedDate,
          startTime: newStartTime,
          duration,
        };
      })
    );

    if (overlap) {
      toast.error("시간이 겹치는 일정이 있습니다!");
      return false;
    }
    return true;
  };

  const handleDeleteBlock = (id: string) => {
    setBlocks((prevBlocks) => prevBlocks.filter((block) => block.id !== id));
    toast.info("일정이 삭제되었습니다!");
  };

  const handleSave = () => {
    localStorage.setItem("blocks", JSON.stringify(blocks));
    toast.success("일정이 저장되었습니다!");
  };

  return (
    <main className="container mx-auto p-6 min-h-screen">
      <ToastContainer position="top-center" autoClose={2000} />
      <div className="flex justify-between items-start mb-8">
        <div className="min-w-[320px]">
          <ProfileContainer profile={profile} />
        </div>
        <div className="flex flex-col items-end gap-6 flex-1">
          <div className="flex space-x-6">
            <DraggableBlock type="휴가" color="#F7B299" />
            <DraggableBlock type="외근" color="#7EDC92" />
            <DraggableBlock type="회의" color="#7EC6F7" />
          </div>
        </div>
      </div>
      <ChartContainer
        blocks={blocks}
        onResizeBlock={handleResizeBlock}
        onDeleteBlock={handleDeleteBlock}
        startHour={startHour}
        onAddBlock={handleAddBlock}
        onMoveBlock={handleMoveBlock}
      />
      <button
        onClick={handleSave}
        className="fixed bottom-8 right-8 bg-blue-500 hover:bg-blue-600 text-white text-lg font-bold px-8 py-2 rounded-lg shadow-lg transition-all z-50"
      >
        저장
      </button>
    </main>
  );
}
