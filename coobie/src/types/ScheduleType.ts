export interface BlockType {
  id: string;
  day: number; // 0-6 (월-일)
  startTime: number; // 시작 시간 (24시간 형식)
  duration: number; // 지속 시간 (시간 단위)
  type: "휴가" | "외근" | "회의";
  color: string;
}

export interface ProfileType {
  name: string;
  title: string;
  company: string;
  avatar: string;
}
