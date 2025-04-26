"use client";
import React, { useState, useEffect } from "react";
import ProfileContainer from "@/app/components/ProfileContainer";
import ChartContainer from "@/app/components/ChartContainer";
import DraggableBlock from "@/app/components/DraggableBlock";
import { BlockType, ProfileType } from "@/types/ScheduleType";
import { ToastContainer, toast } from "react-toastify";
import { convertBlockToDto } from "@/application/usecases/schedule/dto/scheduleDtoConverter";
import { convertScheduleToBlock } from "@/application/usecases/schedule/dto/scheduleDtoConverter";
import { FetchSchedulesDto } from "@/application/usecases/schedule/dto/FetchSchedulesDto";
import "react-toastify/dist/ReactToastify.css";

// 날짜를 'YYYY-MM-DD' 포맷으로 통일하는 함수
function formatDateString(date: string | Date): string {
  if (typeof date === "string") return date;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

export default function SchedulesPage() {
  // 시작 시간 (9시)
  const [startHour] = useState(9);

  // 전체 블록 리스트
  // 1. 로컬 스토리지에서 초기 상태 불러오기
  const [blocks, setBlocks] = useState<BlockType[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem("scheduleBlocks");
    return saved ? JSON.parse(saved) : [];
  });

  // 2. blocks 상태가 변경될 때마다 로컬 스토리지에 저장
  useEffect(() => {
    localStorage.setItem("scheduleBlocks", JSON.stringify(blocks));
  }, [blocks]);

  // 삭제할 블록 ID 목록 (저장 시 DB에서 삭제)
  const [blocksToDelete, setBlocksToDelete] = useState<number[]>([]);

  // 사용자 프로필
  const [profile, setProfile] = useState<ProfileType | null>(null);

  // 데이터 로딩 상태
  const [loading, setLoading] = useState(true);

  console.log("[fetchScheduleData] 시작");
  // 스케줄 데이터 조회 함수
  const fetchScheduleData = async () => {
    try {
      console.log("[fetchScheduleData] 시작");
      console.log("최신 스케줄 데이터 불러오기 시작");
      const scheduleRes = await fetch("/api/schedules", {
        cache: "no-store",
      });

      if (!scheduleRes.ok) throw new Error("일정 데이터 조회 실패");
      const data = await scheduleRes.json();

      // 로깅 추가
      console.log("서버에서 받은 원본 데이터:", data.blocks[0]);

      // 서버 데이터를 UI 형식으로 변환
      let fetchedBlocks: BlockType[] = [];
      if (data?.blocks && Array.isArray(data.blocks)) {
        fetchedBlocks = (data.blocks as FetchSchedulesDto[])
          .filter((schedule) => !schedule.deletedAt)
          .map((schedule) => convertScheduleToBlock(schedule));
      }

      // 로깅 추가
      console.log("변환된 블록 데이터:", fetchedBlocks[0]);

      setBlocks(fetchedBlocks);
    } catch (e) {
      console.error("데이터 불러오기 오류:", e);
      toast.error("최신 일정 불러오기 실패!");
    }
  };

  // 프로필 및 스케줄 데이터 불러오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 프로필, 부서, 직급 정보 동시 요청
        const [profileRes, departmentsRes, positionsRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/departments"),
          fetch("/api/positions"),
        ]);
        if (!profileRes.ok) throw new Error("Profile fetch failed");
        const { user } = await profileRes.json();

        // 부서와 직급 데이터 파싱
        const departments = departmentsRes.ok
          ? await departmentsRes.json()
          : [];
        const positions = positionsRes.ok ? await positionsRes.json() : [];

        // 부서 ID를 이름으로 매핑
        const getDepartmentName = (deptId?: number) => {
          if (!deptId) return "정보 없음";
          const dept = departments.find(
            (d: any) => String(d.id) === String(deptId)
          );
          return dept?.departmentName || "정보 없음";
        };

        // 직급 ID를 이름으로 매핑
        const getPositionName = (posId?: number) => {
          if (!posId) return "정보 없음";
          const pos = positions.find(
            (p: any) => String(p.id) === String(posId)
          );
          return pos?.positionName || "정보 없음";
        };

        console.log("받아온 user 데이터:", user); // user 객체 확인
        console.log("부서명:", getDepartmentName(user.departmentId));
        console.log("직급명:", getPositionName(user.positionId));

        // 프로필 데이터 설정
        setProfile({
          id: user.id,
          name: user.name || user.username || user.nickname,
          nickname: user.nickname,
          position: getPositionName(user.positionId),
          department: getDepartmentName(user.departmentId),
          avatar: user.avatarUrl || "/default-avatar.png",
        });

        // 서버에서 데이터 가져오기
        const scheduleRes = await fetch("/api/schedules");

        if (scheduleRes.ok) {
          const data = await scheduleRes.json();
          const serverBlocks = data?.blocks || [];

          // 서버 데이터로 상태 업데이트 (UTC→KST 변환 포함)
          setBlocks(
            Array.isArray(serverBlocks)
              ? serverBlocks.map((schedule) => convertScheduleToBlock(schedule))
              : []
          );
        }
      } catch (e) {
        toast.error("데이터 불러오기 실패!");
        console.error("데이터 불러오기 오류:", e);
        console.error("서버 데이터 불러오기 실패:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 새로운 블록 추가 함수
  const handleAddBlock = (
    type: "휴가" | "외근" | "회의",
    date: string,
    startTime: number
  ) => {
    const duration = 2;
    const endTime = startTime + duration - 1;
    // 차트 범위: 9~19시
    if (startTime < 9 || endTime > 19) {
      toast.error("허용된 시간 범위를 벗어났습니다!");
      return;
    }

    // 시간 겹침 체크
    const formattedDate = formatDateString(date);
    const isOverlap = (blocks || []).some((block) => {
      if (formatDateString(block.date) !== formattedDate) return false;
      const blockEnd = block.startTime + block.duration;
      return startTime < blockEnd && endTime > block.startTime;
    });

    if (isOverlap) {
      toast.error("시간이 겹치는 일정이 있습니다!");
      return;
    }

    // 타입별 색상 지정
    const colors = {
      휴가: "#F7B299",
      외근: "#7EDC92",
      회의: "#7EC6F7",
    };

    // 새 블록 생성
    const newBlock: BlockType = {
      id: Date.now(),
      date: formattedDate,
      startTime,
      duration,
      type,
      color: colors[type],
      expansionState: type !== "회의" ? 0 : undefined, // 회의는 expansionState 사용 안 함
    };

    setBlocks((prev) => [...prev, newBlock]);
    toast.success("일정이 추가되었습니다. 저장 버튼을 눌러 완료하세요.");
  };

  // 블록 리사이즈 함수 (크기 조정)
  const handleResizeBlock = (
    id: number,
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

        // 리사이즈 후 겹침 체크
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

  // 블록 이동 함수 (날짜 및 시간 변경)
  const handleMoveBlock = (
    id: number,
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

        // 이동 후 겹침 체크
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

  // 블록 삭제 함수
  const handleDeleteBlock = (id: number) => {
    // UI에서 블록 제거
    setBlocks((prevBlocks) => prevBlocks.filter((block) => block.id !== id));

    // DB에 저장된 블록만 삭제 대기 목록에 추가
    if (id < 1_000_000_000_000) {
      setBlocksToDelete((prev) => [...prev, id]);
      toast.info("일정이 삭제되었습니다. 저장 버튼을 눌러 완료하세요.");
    } else {
      // 로컬에서만 존재하던 블록은 그냥 UI에서만 제거
      toast.info("추가했던 일정이 취소되었습니다.");
    }
  };

  // 스케줄 저장 함수 - 수정된 부분
  const handleSave = async () => {
    try {
      if (!profile) {
        toast.error("사용자 정보가 없습니다!");
        return;
      }

      // 1. 모든 블럭을 서버로 보냄 (신규+기존 모두)
      const dtos = blocks.map((block) => convertBlockToDto(block, profile.id));
      if (dtos.length > 0) {
        const saveRes = await fetch("/api/schedules", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ schedules: dtos }),
        });
        if (!saveRes.ok) throw new Error("일정 저장 실패");
      }

      // 2. 삭제할 블럭 처리
      if (blocksToDelete.length > 0) {
        await Promise.all(
          blocksToDelete.map((id) =>
            fetch(`/api/schedules/${id}?userId=${profile.id}`, {
              method: "DELETE",
            })
          )
        );
        setBlocksToDelete([]);
      }

      toast.success("일정이 저장되었습니다!");
      await fetchScheduleData();
    } catch (error) {
      toast.error(
        "저장 실패: " +
          (error instanceof Error ? error.message : "알 수 없는 오류")
      );
    }
  };
  // 로딩 중 처리
  if (loading) return <div>Loading...</div>;
  if (!profile) return <div>프로필 로딩 중...</div>;

  // 메인 렌더링
  return (
    <main className="container mx-auto p-6 min-h-screen">
      {/* 알림창 설정 */}
      <ToastContainer position="top-center" autoClose={2000} />

      {/* 상단: 프로필 + 드래그 블록 */}
      <div className="flex justify-between items-start mb-8">
        {/* 프로필 영역 */}
        <div className="min-w-[320px]">
          <ProfileContainer profile={profile} />
        </div>

        {/* 드래그 가능한 블록들 */}
        <div className="flex flex-col items-end gap-6 flex-1">
          <div className="flex space-x-6">
            <DraggableBlock type="휴가" color="#F7B299" />
            <DraggableBlock type="외근" color="#7EDC92" />
            <DraggableBlock type="회의" color="#7EC6F7" />
          </div>
        </div>
      </div>

      {/* 차트 (일정 캘린더) */}
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
