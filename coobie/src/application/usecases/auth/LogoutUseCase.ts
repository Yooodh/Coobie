export class LogoutUseCase {
  async execute(): Promise<void> {
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
    } catch (error) {
      console.error("로그아웃 중 오류: ", error);
      throw error;
    }
  }
}
