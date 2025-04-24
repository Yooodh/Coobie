// filepath: c:\Users\이성재\Desktop\Side Project\Coobie\coobie\src\utils\auth.ts
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET); // JWT 생성 시 사용한 비밀 키

export async function getTokenData(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    console.log("Decoded Token Payload:", payload);
    return payload;
  } catch (err) {
    if (err instanceof Error) {
      console.error("Failed to decode token:", err.message);
    } else {
      console.error("Failed to decode token:", err);
    }
    return null;
  }
}