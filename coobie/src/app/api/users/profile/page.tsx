// src/app/user/profile/page.tsx
"use client";

import { useState, useEffect, DragEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface User {
  id: string;
  username: string;
  nickname: string;
  departmentId?: number;
  departmentName?: string;
  positionId?: number;
  positionName?: string;
  profileMessage?: string;
  status: "online" | "offline" | "busy" | "away";
  profileImageUrl?: string;
}

interface Schedule {
  id: number;
  date: string;
  scheduleType: "휴가" | "외근" | "회의" | "기타";
  startAt: string;
  endAt?: string;
  description?: string;
}

export default function UserProfile() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 현재 월 관련 상태
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);
  
  // 일정 타입
  const scheduleTypes = [
    { id: "휴가", color: "bg-blue-500", textColor: "text-blue-500" },
    { id: "외근", color: "bg-green-500", textColor: "text-green-500" },
    { id: "회의", color: "bg-purple-500", textColor: "text-purple-500" },
    { id: "기타", color: "bg-gray-500", textColor: "text-gray-500" },
  ];
  
  // 드래그 중인 일정 타입
  const [draggedScheduleType, setDraggedScheduleType] = useState<string | null>(null);
  
  // 선택된 날짜와 일정 설명
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [scheduleDescription, setScheduleDescription] = useState("");
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // 상태 변경 처리
  const handleStatusChange = async (status: string) => {
    try {
      const response = await fetch("/api/users/status", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setUser(prev => prev ? { ...prev, status: status as any } : null);
      }
    } catch (err) {
      console.error("상태 변경 중 오류가 발생했습니다:", err);
    }
  };

  // 데이터 로딩
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 사용자 정보 가져오기
        const userResponse = await fetch("/api/auth/me");
        if (!userResponse.ok) {
          throw new Error("사용자 정보를 불러오는데 실패했습니다");
        }
        const userData = await userResponse.json();
        
        // 일정 정보 가져오기
        const schedulesResponse = await fetch(`/api/schedules?userId=${userData.user.id}`);
        if (!schedulesResponse.ok) {
          throw new Error("일정 정보를 불러오는데 실패했습니다");
        }
        const schedulesData = await schedulesResponse.json();
        
        setUser(userData.user);
        setSchedules(schedulesData.schedules || []);
      } catch (err: any) {
        setError(err.message || "데이터를 불러오는 중 오류가 발생했습니다");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // 달력 데이터 생성
  useEffect(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // 현재 월의 첫째 날
    const firstDay = new Date(year, month, 1);
    // 현재 월의 마지막 날
    const lastDay = new Date(year, month + 1, 0);
    
    // 첫째 날의 요일 (0: 일요일, 6: 토요일)
    const firstDayOfWeek = firstDay.getDay();
    
    // 달력에 표시할 날짜들 계산
    const days: Date[] = [];
    
    // 이전 달의 날짜들 (첫째 날이 일요일이 아닌 경우)
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const prevMonthDay = new Date(year, month, 1 - (i + 1));
      days.push(prevMonthDay);
    }
    
    // 현재 달의 날짜들
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    // 다음 달의 날짜들 (마지막 날이 토요일이 아닌 경우)
    const lastDayOfWeek = lastDay.getDay();
    for (let i = 1; i <= 6 - lastDayOfWeek; i++) {
      days.push(new Date(year, month + 1, i));
    }
    
    setCalendarDays(days);
  }, [currentMonth]);

  // 드래그 이벤트 핸들러
  const handleDragStart = (type: string) => {
    setDraggedScheduleType(type);
  };
  
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  
  const handleDrop = (e: DragEvent<HTMLDivElement>, date: Date) => {
    e.preventDefault();
    
    if (!draggedScheduleType) return;
    
    setSelectedDate(date);
    setShowScheduleModal(true);
  };

  // 일정 저장
  const handleSaveSchedule = async () => {
    if (!selectedDate || !draggedScheduleType) return;
    
    try {
      const newSchedule = {
        userId: user?.id,
        date: selectedDate.toISOString().