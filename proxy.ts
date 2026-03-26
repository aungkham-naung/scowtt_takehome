import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const encodedKey = new TextEncoder().encode(process.env.SESSION_SECRET!);

// get the session from the cookie
async function getSessionFromCookie(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  if (!session) return null;
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as { userId: string };
  } catch {
    return null;
  }
}

// proxy to handle redirects based on auth
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await getSessionFromCookie(request);

  // not signed in --> only allowing pulbic routes and google redirect routes
  if (!session) {
    if (pathname === "/" || pathname.startsWith("/api/auth")) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // signed in --> send to dashboard (the differentiation between new and existing users redirect will be handled in layout.tsx)
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
