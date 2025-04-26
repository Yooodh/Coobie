export interface BlockType {
  id: string;
  date: string;
  startTime: number;
  duration: number;
  type: "휴가" | "외근" | "회의";
  color: string;
  expansionState?: 0 | 1 | 2; // 0: 기본(2칸), 1: 4칸, 2: 전체
}

export interface ProfileType {
  name: string;
  nickname?: string;
  position: string;
  department: string;
  avatar: string;
}
