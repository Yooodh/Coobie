// "use client";

// import { User } from "@/domain/entities/User";

// interface UserTableProps {
//   users: User[];
//   onResetPassword: (userId: string) => void;
//   onToggleLock: (userId: string, currentStatus: boolean) => void;
//   onDeleteUser: (userId: string) => void;
// }

// export default function UserTable({
//   users,
//   onResetPassword,
//   onToggleLock,
//   onDeleteUser,
// }: UserTableProps) {
//   const formatDate = (date: Date | undefined) => {
//     if (!date) return "N/A";
//     return new Date(date)
//       .toLocaleDateString("ko-KR", {
//         year: "numeric",
//         month: "2-digit",
//         day: "2-digit",
//       })
//       .replace(/\. /g, ".")
//       .replace(/\.$/, "");
//   };

//   return (
//     <div className="overflow-x-auto">
//       <table className="min-w-full">
//         <thead>
//           <tr className="border-b border-gray-200">
//             <th className="py-3 px-4 text-center">
//               <div className="w-8 h-8 mx-auto bg-gray-200 rounded-full"></div>
//             </th>
//             <th className="py-3 px-4 text-center">2025.04.14</th>
//             <th className="py-3 px-4 text-center text-red-500">삭제</th>
//           </tr>
//         </thead>
//         <tbody>
//           {users.length === 0 ? (
//             <tr>
//               <td colSpan={3} className="py-10 text-center text-gray-500">
//                 사용자 정보가 없습니다
//               </td>
//             </tr>
//           ) : (
//             users.map((user) => (
//               <tr
//                 key={user.id}
//                 className="border-b border-gray-200 hover:bg-gray-50"
//               >
//                 <td className="py-4 px-4 text-center">
//                   <div className="flex justify-center">
//                     <button
//                       onClick={() => onToggleLock(user.id, user.isLocked)}
//                       className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center"
//                     >
//                       {user.isLocked ? (
//                         <svg
//                           xmlns="http://www.w3.org/2000/svg"
//                           viewBox="0 0 24 24"
//                           fill="currentColor"
//                           className="w-4 h-4 text-red-500"
//                         >
//                           <path
//                             fillRule="evenodd"
//                             d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z"
//                             clipRule="evenodd"
//                           />
//                         </svg>
//                       ) : (
//                         <svg
//                           xmlns="http://www.w3.org/2000/svg"
//                           viewBox="0 0 24 24"
//                           fill="currentColor"
//                           className="w-4 h-4 text-green-500"
//                         >
//                           <path d="M18 1.5c2.9 0 5.25 2.35 5.25 5.25v3.75a.75.75 0 01-1.5 0V6.75a3.75 3.75 0 10-7.5 0v3a3 3 0 013 3v6.75a3 3 0 01-3 3H3.75a3 3 0 01-3-3v-6.75a3 3 0 013-3h9v-3c0-2.9 2.35-5.25 5.25-5.25z" />
//                         </svg>
//                       )}
//                     </button>
//                   </div>
//                 </td>
//                 <td className="py-4 px-4 text-center">
//                   {formatDate(user.createdAt)}
//                 </td>
//                 <td className="py-4 px-4 text-center">
//                   <button
//                     onClick={() => onDeleteUser(user.id)}
//                     className="text-red-500 hover:text-red-700 font-medium"
//                   >
//                     삭제
//                   </button>
//                 </td>
//               </tr>
//             ))
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// }

"use client";

import { User } from "@/domain/entities/User";

interface UserTableProps {
  users: User[];
  onResetPassword: (userId: string) => void;
  onToggleLock: (userId: string, currentStatus: boolean) => void;
  onDeleteUser: (userId: string) => void;
}

export default function UserTable({ users, onResetPassword, onToggleLock, onDeleteUser }: UserTableProps) {
  const formatDate = (date: Date | undefined | string) => {
    if (!date) return "-";
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).replace(/\. /g, ".").replace(/\.$/, "");
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="py-3 px-4 text-center">상태</th>
            <th className="py-3 px-4 text-center">사용자명</th>
            <th className="py-3 px-4 text-center">닉네임</th>
            <th className="py-3 px-4 text-center">부서</th>
            <th className="py-3 px-4 text-center">직급</th>
            <th className="py-3 px-4 text-center">생성일</th>
            <th className="py-3 px-4 text-center text-red-500">삭제</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-10 text-center text-gray-500">
                사용자 정보가 없습니다
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-4 px-4 text-center">
                  <div className="flex justify-center">
                    <button
                      onClick={() => onToggleLock(user.id, user.isLocked)}
                      className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center"
                    >
                      {user.isLocked ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-red-500">
                          <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-green-500">
                          <path d="M18 1.5c2.9 0 5.25 2.35 5.25 5.25v3.75a.75.75 0 01-1.5 0V6.75a3.75 3.75 0 10-7.5 0v3a3 3 0 013 3v6.75a3 3 0 01-3 3H3.75a3 3 0 01-3-3v-6.75a3 3 0 013-3h9v-3c0-2.9 2.35-5.25 5.25-5.25z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </td>
                <td className="py-4 px-4 text-center">{user.username}</td>
                <td className="py-4 px-4 text-center">{user.nickname}</td>
                <td className="py-4 px-4 text-center">{user.departmentId || "-"}</td>
                <td className="py-4 px-4 text-center">{user.positionId || "-"}</td>
                <td className="py-4 px-4 text-center">{formatDate(user.createdAt)}</td>
                <td className="py-4 px-4 text-center">
                  <button
                    onClick={() => onDeleteUser(user.id)}
                    className="text-red-500 hover:text-red-700 font-medium"
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}