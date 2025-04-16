import { createClient } from "@/utils/supabase/server";
import { User } from "@/domain/entities/User";

export default async function UserPage() {
  console.log("페이지 함수 시작");

  try {
    const supabase = await createClient();
    console.log("Supabase 클라이언트 생성 성공");

    const { data, error } = await supabase.from("user").select("*");

    if (error) {
      console.error("ERROR FETCHING USERS", error.message, error.details);
      return (
        <div>
          사용자 정보를 불러오는 중 오류가 발생했습니다: {error.message}
        </div>
      );
    }

    console.log("데이터 가져오기 성공:", data ? data.length : 0);

    const users = data.map((item) => ({
      id: item.ID,
      username: item.username,
      nickname: item.nickname,
      password: item.password,
      isLocked: item.is_locked, // Adjusted to match User type
      deletedAt: item.deleted_at ?? null,
      createdAt: item.created_at ?? null,
      isApproved: item.is_approved ?? false,
      notificationOn: item.notification_on ?? true,
      departmentId: item.department_id ?? null,
      positionId: item.position_id ?? null,
      roleId: item.role_id ?? null,
    })) as User[];

    return (
      <div>
        <h1>사용자 목록</h1>
        <ul>
          {users.map((user) => (
            <li key={user.id}>
              <div style={{border: "1px solid black"}}>
                <h1>ID: {user.id}</h1>
                <p>Username: {user.username}</p>
                <p>Nickname: {user.nickname}</p>
                <p>Password: {user.password}</p>
                <p>Is Locked: {user.isLocked ? "Yes" : "No"}</p>
                <p>Deleted At: {user.deletedAt ? user.deletedAt.toLocaleString() : "N/A"}</p>
                <p>Created At: {user.createdAt ? user.createdAt.toLocaleString() : "N/A"}</p>
                <p>Is Approved: {user.isApproved ? "Yes" : "No"}</p>
                <p>Notification On: {user.notificationOn ? "Yes" : "No"}</p>
                <p>Department ID: {user.departmentId || "N/A"}</p>
                <p>Position ID: {user.positionId || "N/A"}</p>
                <p>Role ID: {user.roleId || "N/A"}</p>
              </div>
              <br />
            </li>
          ))}
        </ul>
      </div>
    );
  } catch (e) {
    console.error("예상치 못한 오류:", e);
    return <div>예상치 못한 오류가 발생했습니다.</div>;
  }
}
