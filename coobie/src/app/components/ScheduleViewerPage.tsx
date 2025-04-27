"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProfileContainer from "@/app/components/ProfileContainer";
import ChartContainer from "@/app/components/ChartContainer";
import DraggableBlock from "@/app/components/DraggableBlock";
import { BlockType, ProfileType } from "@/types/ScheduleType";
import { ToastContainer, toast } from "react-toastify";
import { convertBlockToDto } from "@/application/usecases/schedule/dto/scheduleDtoConverter";
import { convertScheduleToBlock } from "@/application/usecases/schedule/dto/scheduleDtoConverter";
import { FetchSchedulesDto } from "@/application/usecases/schedule/dto/FetchSchedulesDto";
import "react-toastify/dist/ReactToastify.css";

function formatDateString(date: string | Date): string {
  if (typeof date === "string") return date;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

interface ScheduleViewerPageProps {
  params?: { userId?: string };
}

export default function ScheduleViewerPage({
  params,
}: ScheduleViewerPageProps) {
  const router = useRouter();
  const [startHour] = useState(9);
  const [blocks, setBlocks] = useState<BlockType[]>([]);
  const [blocksToDelete, setBlocksToDelete] = useState<number[]>([]);
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [userId, setUserId] = useState<string | undefined>(params?.userId);

  const fetchScheduleData = async (userId: string) => {
    try {
      const scheduleRes = await fetch(`/api/schedules?userId=${userId}`, {
        cache: "no-store",
        credentials: "include",
      });
      if (!scheduleRes.ok) throw new Error("일정 데이터 조회 실패");
      const data = await scheduleRes.json();
      let fetchedBlocks: BlockType[] = [];
      if (data?.blocks && Array.isArray(data.blocks)) {
        fetchedBlocks = (data.blocks as FetchSchedulesDto[])
          .filter((schedule) => !schedule.deletedAt)
          .map((schedule) => convertScheduleToBlock(schedule));
      }
      setBlocks(fetchedBlocks);
    } catch (e) {
      toast.error("최신 일정 불러오기 실패!");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await fetch("/api/auth/me");
        if (!profileRes.ok) throw new Error("인증 정보 조회 실패");
        const { user: currentUser } = await profileRes.json();

        const targetUserId = params?.userId || currentUser.id;
        setUserId(targetUserId);
        setIsOwner(targetUserId === currentUser.id);

        if (targetUserId === currentUser.id) {
          setProfile(currentUser);
        } else {
          const otherProfileRes = await fetch(`/api/users/${targetUserId}`);
          if (!otherProfileRes.ok) throw new Error("타인 프로필 조회 실패");
          setProfile(await otherProfileRes.json());
        }

        await fetchScheduleData(targetUserId);
      } catch (e) {
        toast.error("데이터 불러오기 실패: " + (e as Error).message);
        if (!params?.userId) router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params?.userId, router]);

  const handleAddBlock = (
    type: "휴가" | "외근" | "회의",
    date: string,
    startTime: number
  ) => {
    const newBlock: BlockType = {
      id: Date.now(),
      date: formatDateString(date),
      startTime,
      duration: 2,
      type,
      color: { 휴가: "#F7B299", 외근: "#7EDC92", 회의: "#7EC6F7" }[type],
    };
    setBlocks((prev) => [...prev, newBlock]);
  };

  const handleResizeBlock = (
    id: number,
    newDuration: number,
    newStartTime?: number,
    expansionState?: 0 | 1 | 2
  ) => {
    setBlocks((prevBlocks) =>
      prevBlocks.map((block) =>
        block.id === id
          ? {
              ...block,
              startTime: newStartTime ?? block.startTime,
              duration: newDuration,
              expansionState: expansionState ?? block.expansionState, // 확장 상태 반영
            }
          : block
      )
    );
  };

  const handleMoveBlock = (id: number, date: string, startTime: number) => {
    setBlocks((prevBlocks) =>
      prevBlocks.map((block) =>
        block.id === id
          ? { ...block, date: formatDateString(date), startTime }
          : block
      )
    );
  };

  const handleDeleteBlock = (id: number) => {
    setBlocks((prevBlocks) => prevBlocks.filter((block) => block.id !== id));
    setBlocksToDelete((prev) => [...prev, id]);
  };

  const handleSave = async () => {
    try {
      if (!profile) return;
      const dtos = blocks.map((block) => convertBlockToDto(block, profile.id));
      await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schedules: dtos }),
      });
      await Promise.all(
        blocksToDelete.map((id) =>
          fetch(`/api/schedules/${id}?userId=${profile.id}`, {
            method: "DELETE",
          })
        )
      );
      toast.success("일정 저장 완료!");
      setBlocksToDelete([]);
      if (userId) {
        await fetchScheduleData(userId);
      }
    } catch (error) {
      toast.error(
        "저장 실패: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!profile) return <div>프로필 로딩 중...</div>;

  return (
    <main className="container mx-auto p-6 min-h-screen">
      <ToastContainer position="top-center" autoClose={2000} />

      <div className="flex justify-between items-start mb-8">
        <div className="min-w-[320px]">
          <ProfileContainer profile={profile} />
        </div>
        {isOwner && (
          <div className="flex space-x-6">
            <DraggableBlock type="휴가" color="#F7B299" />
            <DraggableBlock type="외근" color="#7EDC92" />
            <DraggableBlock type="회의" color="#7EC6F7" />
          </div>
        )}
      </div>

      <ChartContainer
        blocks={blocks}
        onResizeBlock={isOwner ? handleResizeBlock : () => {}}
        onDeleteBlock={isOwner ? handleDeleteBlock : () => {}}
        startHour={startHour}
        onAddBlock={isOwner ? handleAddBlock : undefined}
        onMoveBlock={isOwner ? handleMoveBlock : undefined}
        readOnly={!isOwner}
      />

      {isOwner && (
        <button
          onClick={handleSave}
          className="fixed bottom-8 right-8 bg-blue-500 hover:bg-blue-600 text-white text-lg font-bold px-8 py-2 rounded-lg shadow-lg transition-all z-50"
        >
          저장
        </button>
      )}

      {!isOwner && (
        <div className="text-center py-4 text-gray-500">
          다른 사용자의 스케줄을 확인 중입니다. 수정 권한이 없습니다.
        </div>
      )}
    </main>
  );
}
