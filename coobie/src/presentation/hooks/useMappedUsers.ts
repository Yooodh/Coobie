import { useMemo } from "react";

type User = {
  id: string;
  username: string;
  departmentId: number;
  positionId: number;
};

type Department = {
  id: number;
  departmentName: string;
};

type Position = {
  id: number;
  positionName: string;
};

export function useMappedUsers(
  users: User[],
  departments: Department[],
  positions: Position[]
) {
  const departmentMap = new Map(departments.map(d => [d.id, d.departmentName]));
  const positionMap = new Map(positions.map(p => [p.id, p.positionName]));
  console.log(departmentMap);
  console.log(positionMap);
  const mappedUsers = users.map(user => ({
    ...user,
    departmentName: departmentMap.get(user.departmentId) || "부서 없음",
    positionName: positionMap.get(user.positionId) || "직급 없음",
  }));

  return mappedUsers;
}
