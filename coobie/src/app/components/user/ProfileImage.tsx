// // src/app/components/user/ProfileImage.tsx
// "use client";

// import { useState, useEffect } from "react";
// import Image from "next/image";

// interface ProfileImageProps {
//   userId: string;
//   size?: number;
//   className?: string;
//   showStatus?: boolean;
//   status?: 'online' | 'offline' | 'busy' | 'away';
// }

// export default function ProfileImage({ 
//   userId, 
//   size = 40, 
//   className = "", 
//   showStatus = false,
//   status = 'offline'
// }: ProfileImageProps) {
//   const [imageUrl, setImageUrl] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchProfileImage = async () => {
//       try {
//         setLoading(true);
//         const response = await fetch(`/api/users/profile-image?userId=${userId}`);
        
//         if (!response.ok) {
//           throw new Error("프로필 이미지를 불러오는데 실패했습니다");
//         }
        
//         const data = await response.json();
//         // setImageUrl(data.imageUrl);
//         setImageUrl(data.profileImage.fileUrl);

//       } catch (err) {
//         console.error("Profile image fetch error:", err);
//         setError(err instanceof Error ? err.message : "이미지 로딩 실패");
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (userId) {
//       fetchProfileImage();
//     }
//   }, [userId]);

//   // 상태에 따른 색상 지정
//   const getStatusColor = () => {
//     switch (status) {
//       case "online": return "bg-green-500";
//       case "busy": return "bg-red-500";
//       case "away": return "bg-yellow-500";
//       default: return "bg-gray-400";
//     }
//   };

//   // 이니셜 생성 (사용자 ID에서 첫 글자 가져오기)
//   const getInitial = () => {
//     return userId.charAt(0).toUpperCase();
//   };

//   return (
//     <div className={`relative ${className}`}>
//       <div 
//         className={`overflow-hidden rounded-full bg-gray-200 flex items-center justify-center`}
//         style={{ width: `${size}px`, height: `${size}px` }}
//       >
//         {loading ? (
//           // 로딩 스피너
//           <div className="animate-pulse w-full h-full bg-gray-300"></div>
//         ) : imageUrl ? (
//           // 이미지가 있는 경우
//           <Image
//             src={imageUrl}
//             alt="Profile"
//             width={size}
//             height={size}
//             className="object-cover w-full h-full"
//             onError={() => {
//               setError("이미지 로드 실패");
//               setImageUrl(null);
//             }}
//           />
//         ) : (
//           // 이미지가 없는 경우 이니셜 표시
//           <div className="text-gray-600 font-medium text-center" style={{ fontSize: `${Math.max(size / 2.5, 10)}px` }}>
//             {getInitial()}
//           </div>
//         )}
//       </div>
      
//       {/* 상태 표시 뱃지 */}
//       {showStatus && (
//         <div 
//           className={`absolute bottom-0 right-0 border-2 border-white rounded-full ${getStatusColor()}`} 
//           style={{ width: `${size / 4}px`, height: `${size / 4}px` }}
//         />
//       )}
//     </div>
//   );
// }