// src/app/components/ScheduleViewerPage.tsx
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

  // 부서/직급 목록 상태 추가
  const [departments, setDepartments] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);

  // 스케줄 데이터 fetch
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

  // 프로필 + 부서/직급명 매핑 fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 부서/직급 목록 병렬 fetch
        const [departmentsRes, positionsRes] = await Promise.all([
          fetch("/api/departments"),
          fetch("/api/positions"),
        ]);
        const departmentsData = departmentsRes.ok
          ? await departmentsRes.json()
          : [];
        const positionsData = positionsRes.ok ? await positionsRes.json() : [];
        setDepartments(departmentsData);
        setPositions(positionsData);

        // 사용자 정보 fetch
        const profileRes = await fetch("/api/auth/me");
        if (!profileRes.ok) throw new Error("인증 정보 조회 실패");
        const { user: currentUser } = await profileRes.json();

        const targetUserId = params?.userId || currentUser.id;
        setUserId(targetUserId);
        setIsOwner(targetUserId === currentUser.id);

        let userData;
        if (targetUserId === currentUser.id) {
          userData = currentUser;
        } else {
          const otherProfileRes = await fetch(`/api/users/${targetUserId}`);
          if (!otherProfileRes.ok) throw new Error("타인 프로필 조회 실패");
          userData = await otherProfileRes.json();
        }

        // 부서/직급명 매핑
        const departmentName = departmentsData.find(
          (d: any) => d.id === userData.departmentId
        )?.departmentName;
        const positionName = positionsData.find(
          (p: any) => p.id === userData.positionId
        )?.positionName;

        setProfile({
          ...userData,
          department: departmentName,
          position: positionName,
        });

        console.log("params.userId:", params?.userId);
        console.log("currentUser.id:", currentUser.id);
        console.log("isOwner:", targetUserId === currentUser.id);

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
              expansionState: expansionState ?? block.expansionState,
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

  if (loading)
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white bg-opacity-60">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
        <span className="mt-4 text-gray-700">로딩 중...</span>
      </div>
    );
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
          className="
          fixed bottom-22 right-9 z-50
          flex items-center justify-center
          bg-blue-500 text-white font-semibold text-base
          px-8 py-2 rounded-full
          border border-blue-100
          shadow-lg
          transition-all duration-150
         hover:bg-blue-600 hover:text-white hover:shadow-xl hover:-translate-y-0.5
          active:scale-95
          cursor-pointer
          gap-1
    "
          style={{
            letterSpacing: "0.05em",
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
          }}
        >
          저장
        </button>
      )}
    </main>
  );
}
