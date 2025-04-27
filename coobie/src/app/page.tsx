// src/app/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log("로그인 시도:", { username });

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      console.log("로그인 응답:", data);

      if (!response.ok) {
        const errorMessage = data.error || "로그인에 실패했습니다";
        
        // 계정 잠금 상태 확인
        if (errorMessage.includes("계정이 잠겨") || errorMessage.includes("계정이 잠금")) {
          setIsLocked(true);
        } 
        // 남은 시도 횟수 파싱
        else if (errorMessage.includes("남은 시도 횟수:")) {
          const match = errorMessage.match(/남은 시도 횟수: (\d+)회/);
          if (match && match[1]) {
            setRemainingAttempts(parseInt(match[1]));
          }
        }
        
        throw new Error(errorMessage);
      }

      // 성공적인 로그인 - 남은 시도 횟수 초기화
      setRemainingAttempts(null);
      setIsLocked(false);

      // 리다이렉션 전 알림 추가
      alert("로그인 성공! 페이지 이동 중...");

      // 역할에 따른 리다이렉션 코드
      if (data.user?.roleId === "00") {
        console.log("루트 관리자로 이동: /root/dashboard");
        router.push("/root/dashboard");
      } else if (data.user?.roleId === "01") {
        console.log("회사 관리자로 이동: /admin/users");
        router.push("/admin/users");
      } else {
        console.log("일반 사용자로 이동: /user/dashboard");
        router.push("/user/dashboard");
      }
    } catch (err: any) {
      console.error("로그인 오류:", err);
      setError(err.message || "로그인 중 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  // 비밀번호 입력 필드 스타일 - 남은 시도 횟수에 따라 변경
  const getPasswordFieldStyle = () => {
    if (isLocked) {
      return "border-red-500 bg-red-50";
    }
    if (remainingAttempts !== null) {
      if (remainingAttempts <= 1) {
        return "border-red-500 bg-red-50"; // 위험
      } else if (remainingAttempts <= 2) {
        return "border-orange-500 bg-orange-50"; // 경고
      }
      return "border-yellow-300 bg-yellow-50"; // 주의
    }
    return "border-gray-300"; // 기본
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <div className="flex justify-center">
            <Image
              src="/images/Coobie_logo.png"
              alt="Coobie Logo"
              width={180}
              height={60}
              priority
            />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            쿠비에 오신 것을 환영합니다
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            사내 사용자 현황과 일정을 한 눈에 확인하세요
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
            {isLocked && (
              <p className="mt-2 font-semibold">
                계정이 잠겼습니다. 관리자에게 비밀번호 초기화를 요청하세요.
              </p>
            )}
            {!isLocked && remainingAttempts !== null && remainingAttempts <= 2 && (
              <p className="mt-2 font-semibold">
                주의: {remainingAttempts}회 더 실패하면 계정이 잠깁니다!
              </p>
            )}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                아이디
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 focus:z-10 sm:text-sm"
                placeholder="아이디"
                disabled={isLocked || loading}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 focus:z-10 sm:text-sm ${getPasswordFieldStyle()}`}
                placeholder="비밀번호"
                disabled={isLocked || loading}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-900"
              >
                로그인 상태 유지
              </label>
            </div>

            <div className="text-sm">
              <Link
                href="/auth/forgot-password"
                className="font-medium text-amber-600 hover:text-amber-500"
              >
                비밀번호를 잊으셨나요?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || isLocked}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 ${
                (loading || isLocked) ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "로그인 중..." : isLocked ? "계정이 잠겼습니다" : "로그인"}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            아직 계정이 없으신가요?{" "}
            <Link
              href="/auth/register"
              className="font-medium text-amber-600 hover:text-amber-500"
            >
              회사 가입 신청하기
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}