import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createServerSupabaseClient() {
  const cookieStore = cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseRoleKey) {
    throw new Error("Supabase 환경 변수가 설정되지 않았습니다.");
  }

  return createServerClient(supabaseUrl, supabaseRoleKey, {
    cookies: {
      get(name) {
        return cookieStore.get(name)?.value || null;
      },
      set(name, value, options) {
        cookieStore.set(name, value, options);
      },
      remove(name) {
        cookieStore.delete(name);
      },
    },
  });
}
