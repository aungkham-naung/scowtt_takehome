import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

// create a session for user
export async function createSession(userId: string) {
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours
  const sessionToken = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .sign(new TextEncoder().encode(process.env.SESSION_SECRET));

  // set the session token in a cookie
  const cookieStore = await cookies();
  cookieStore.set("session", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24,
    path: "/",
  });
}

// get the session for user
export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) return null;

  try {
    // verify the session token
    const { payload } = await jwtVerify(
      session,
      new TextEncoder().encode(process.env.SESSION_SECRET),
      {
        algorithms: ["HS256"],
      },
    );
    return payload as { userId: string };
  } catch {
    return null;
  }
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}
