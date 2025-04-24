"use client";
import React, { useState } from "react";
import ProfileContainer from "@/app/components/ProfileContainer";
import ChartContainer from "@/app/components/ChartContainer";
import DraggableBlock from "@/app/components/DraggableBlock";
import { BlockType, ProfileType } from "@/types/ScheduleType";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Home() {
  const [startHour] = useState(9);
  const [blocks, setBlocks] = useState<BlockType[]>([]);
  const [profile] = useState<ProfileType>({
    name: "유대현",
    title: "FE Developer",
    company: "멋사",
    avatar: "/placeholder-avatar.jpg",
  });

  // date: YYYY-MM-DD
  function isOverlapping(
    blocks: BlockType[],
    date: string,
    startTime: number,
    duration: number,
    exceptBlockId?: string
  ) {
    const endTime = startTime + duration;
    return blocks.some((block) => {
      if (block.date !== date) return false;
      if (block.id === exceptBlockId) return false;
      const blockEnd = block.startTime + block.duration;
      return startTime < blockEnd && endTime > block.startTime;
    });
  }

  // 블록 추가
  const handleAddBlock = (
    type: "휴가" | "외근" | "회의",
    date: string,
    startTime: number
  ) => {
    const duration = 1;
    const endTime = startTime + duration;

    if (startTime < startHour || endTime > 19) {
      setTimeout(() => toast.error("허용된 시간 범위를 벗어났습니다!"), 0);
      return;
    }

    const isOverlap = blocks.some((block) => {
      if (block.date !== date) return false;
      const blockEnd = block.startTime + block.duration;
      return startTime < blockEnd && endTime > block.startTime;
    });

    if (isOverlap) {
      setTimeout(() => toast.error("시간이 겹치는 일정이 있습니다!"), 0);
      return;
    }

    const colors = {
      휴가: "#F7B299",
      외근: "#7EDC92",
      회의: "#7EC6F7",
    };

    const newBlock: BlockType = {
      id: `${Date.now()}-${Math.random()}`,
      date,
      startTime,
      duration,
      type,
      color: colors[type],
    };

    setBlocks((prev) => [...prev, newBlock]);
    setTimeout(() => toast.success("일정이 추가되었습니다!"), 0);
  };

  // 블록 리사이즈
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

        const isOverlap = prevBlocks.some((b) => {
          if (b.id === id || b.date !== block.date) return false;
          const bEnd = b.startTime + b.duration;
          return startTime < bEnd && endTime > b.startTime;
        });

        if (isOverlap) {
          overlap = true;
          return block;
        }
        return { ...block, duration: newDuration, startTime };
      })
    );

    if (overlap) {
      setTimeout(() => toast.error("시간이 겹치는 일정이 있습니다!"), 0);
      return false;
    }
    return true;
  };

  // 블록 이동
  const handleMoveBlock = (
    id: string,
    newDate: string,
    newStartTime: number
  ) => {
    let overlap = false;
    setBlocks((prevBlocks) =>
      prevBlocks.map((block) => {
        if (block.id !== id) return block;
        const endTime = newStartTime + block.duration;

        const isOverlap = prevBlocks.some((b) => {
          if (b.id === id || b.date !== newDate) return false;
          const bEnd = b.startTime + b.duration;
          return newStartTime < bEnd && endTime > b.startTime;
        });

        if (isOverlap) {
          overlap = true;
          return block;
        }
        return { ...block, date: newDate, startTime: newStartTime };
      })
    );
    if (overlap) {
      setTimeout(() => toast.error("시간이 겹치는 일정이 있습니다!"), 0);
      return false;
    }
    return true;
  };

  // 블록 삭제
  const handleDeleteBlock = (id: string) => {
    setBlocks((prevBlocks) => prevBlocks.filter((block) => block.id !== id));
    setTimeout(() => toast.info("일정이 삭제되었습니다!"), 0);
  };

  const handleSave = () => {
    localStorage.setItem("blocks", JSON.stringify(blocks));
    setTimeout(() => toast.success("일정이 저장되었습니다!"), 0);
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
