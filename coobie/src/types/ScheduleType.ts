export interface BlockType {
  id: string;
  date: string; // YYYY-MM-DD (변경: 요일 인덱스 day → 날짜 문자열)
  startTime: number;
  duration: number;
  type: "휴가" | "외근" | "회의";
  color: string;
}

export interface ProfileType {
  name: string;
  title: string;
  company: string;
  avatar: string;
}
