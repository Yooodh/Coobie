// src/application/usecases/auth/LogoutUseCase.ts (수정)
export class LogoutUseCase {
  async execute(): Promise<boolean> {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("로그아웃 처리 중 오류가 발생했습니다.");
      }
      
      // 브라우저 측에서도 쿠키 삭제
      document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      
      // 성공적으로 로그아웃 됨
      return true;
    } catch (error) {
      console.error("로그아웃 중 오류:", error);
      throw error;
    }
  }
}