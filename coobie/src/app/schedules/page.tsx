// 클라이언트 컴포넌트임을 명시 (Next.js에서 클라이언트 측 렌더링용)
"use client";

import React, { useEffect, useState } from "react";
import { DndProvider } from "react-dnd"; // 드래그 앤 드롭 컨텍스트 제공
import { HTML5Backend } from "react-dnd-html5-backend"; // 브라우저 환경에 맞는 백엔드 사용
import DataBlock, { Schedule } from "../components/DataBlock"; // 드래그 가능한 스케줄 블록 컴포넌트
import DataChart from "../components/DataChart"; // 드롭 대상인 차트 컴포넌트

export default function SchedulesPage() {
  // 전체 스케줄 데이터 상태
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  // 차트에 표시될 스케줄 데이터 상태
  const [chartData, setChartData] = useState<Schedule[]>([]);

  // 로딩 여부 상태
  const [loading, setLoading] = useState(true);

  // 컴포넌트 마운트 시 스케줄 데이터 fetch
  useEffect(() => {
    fetch("/api/schedules") // API 호출
      .then((res) => res.json()) // JSON 파싱
      .then((data) => {
        setSchedules(data.data || []); // 데이터 상태 저장
        setLoading(false); // 로딩 상태 해제
      });
  }, []);

  // 스케줄을 차트에 추가하는 핸들러
  const handleDropSchedule = (schedule: Schedule) => {
    // 이미 chartData에 없는 경우만 추가
    if (!chartData.find((s) => s.id === schedule.id)) {
      setChartData((prev) => [...prev, schedule]);
    }
  };

  // 차트에서 스케줄을 제거하는 핸들러
  const handleRemoveSchedule = (scheduleId: number) => {
    // 해당 ID를 제외한 나머지를 chartData에 저장
    setChartData((prev) => prev.filter((s) => s.id !== scheduleId));
  };

  // 로딩 중일 경우 메시지 표시
  if (loading) return <div>로딩 중...</div>;

  // 차트에 이미 추가되지 않은 스케줄만 필터링해서 표시
  const availableSchedules = schedules.filter(
    (schedule) => !chartData.some((s) => s.id === schedule.id)
  );

  return (
    // DnD 기능을 사용할 수 있도록 DndProvider로 전체 감싸기
    <DndProvider backend={HTML5Backend}>
      {/* 페이지 레이아웃 영역 */}
      <div style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
        {/* 페이지 제목 */}
        <h1
          style={{
            textAlign: "center",
            fontSize: "2.5rem",
            fontWeight: "bold",
            marginBottom: "2rem",
          }}
        >
          스케줄 목록
        </h1>

        {/* 드래그 가능한 블록 안내 텍스트 */}
        <h2
          style={{
            textAlign: "center",
            fontSize: "1.5rem",
            margin: "2rem 0 1rem",
          }}
        >
          드래그 가능한 스케줄 블록
        </h2>

        {/* 드래그 가능한 스케줄 블록들 표시 */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            justifyContent: "center",
          }}
        >
          {availableSchedules.map((schedule) => (
            // 각 스케줄을 드래그 가능한 DataBlock 컴포넌트로 렌더링
            <DataBlock key={schedule.id} schedule={schedule} />
          ))}
        </div>
      </div>

      {/* 차트 컴포넌트 - 드롭 대상 및 시각화 영역 */}
      <DataChart
        chartData={chartData} // 차트에 보여줄 스케줄 목록
        onDropSchedule={handleDropSchedule} // 드래그 드롭 시 호출될 핸들러
        onRemoveSchedule={handleRemoveSchedule} // 삭제 버튼 등으로 제거 시 호출될 핸들러
      />
    </DndProvider>
  );
}
