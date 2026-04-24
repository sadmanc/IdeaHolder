import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE_NAME = "ih_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function secret(): Uint8Array {
  const s = process.env.COOKIE_SECRET;
  if (!s || s.length < 32) {
    throw new Error("COOKIE_SECRET is missing or shorter than 32 characters");
  }
  return new TextEncoder().encode(s);
}

export async function createSessionToken(): Promise<string> {
  return await new SignJWT({ sub: "owner" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(secret());
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    await jwtVerify(token, secret());
    return true;
  } catch {
    return false;
  }
}
