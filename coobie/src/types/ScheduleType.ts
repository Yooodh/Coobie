export interface BlockType {
  id: number;
  date: string;
  startTime: number;
  duration: number;
  type: "휴가" | "외근" | "회의";
  color: string;
  expansionState?: 0 | 1 | 2; // 0: 기본(2칸), 1: 4칸, 2: 전체
}

export interface ProfileType {
  id: string;
  nickname?: string;
  name: string;
  department?: string; // 부서명
  departmentId?: number; // 부서 ID (있다면)
  position?: string; // 직급명
  positionId?: number; // 직급 ID (있다면)
  profileImageUrl?: string; // 프로필 이미지 URL
}
