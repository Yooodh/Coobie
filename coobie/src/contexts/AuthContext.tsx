"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { AuthUserDto } from "@/application/usecases/auth/dto/AuthUserDto";
import { AuthResponseDto } from "@/application/usecases/auth/dto/AuthResponseDto";
import { LoginRequestDto } from "@/application/usecases/auth/dto/LoginRequestDto";

interface AuthContextType {
  user: AuthUserDto | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUserDto | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 사용자 정보 가져오기
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("인증 확인 중 오류:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // 로그인 함수
  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      const loginRequest: LoginRequestDto = { username, password };

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginRequest),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "로그인에 실패했습니다");
      }

      const authResponse: AuthResponseDto = await response.json();
      setUser(authResponse.user);

      // 역할에 따라 리디렉션
      if (authResponse.user.roleId === "00") {
        // 루트 관리자
        router.push("/root/dashboard");
      } else if (authResponse.user.roleId === "01") {
        // 회사 관리자
        router.push("/admin/users");
      } else {
        // 일반 사용자
        router.push("/user/dashboard");
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error("로그인 중 오류가 발생했습니다");
      }
    } finally {
      setLoading(false);
    }
  };

  // 로그아웃 함수
  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      setUser(null);
      router.push("/");
    } catch (error) {
      console.error("로그아웃 중 오류:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth는 AuthProvider 내에서 사용해야 합니다");
  }
  return context;
}
