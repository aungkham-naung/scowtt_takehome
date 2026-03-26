import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/app/lib/session";
import { prisma } from "@/app/lib/db";

export async function GET(request: NextRequest) {
  // get the code from google authorization callback
  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // exchange the code for access token
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      code,
      grant_type: "authorization_code",
      redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
    }),
  });

  // if no access token, redirect to home page
  const tokens = await tokenResponse.json();
  if (!tokens.access_token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // get the user data from google
  const userResponse = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    },
  );

  const userData = await userResponse.json();

  // upsert the user in the database
  const user = await prisma.user.upsert({
    where: { google_id: userData.id },
    update: {
      email: userData.email,
      name: userData.name,
      profile_url: userData.picture,
    },
    create: {
      google_id: userData.id,
      email: userData.email,
      name: userData.name,
      profile_url: userData.picture,
    },
  });

  // sign the user in
  await createSession(user.id);

  // if the user doesn't have a favorite movie, they need onboarding
  if (!user.favorite_movie) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  // redirect to dashboard for "existing" users
  return NextResponse.redirect(new URL("/dashboard", request.url));
}
