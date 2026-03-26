import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/lib/session";
import { prisma } from "@/app/lib/db";

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const raw = body.movie;

  if (typeof raw !== "string") {
    return NextResponse.json({ error: "Movie is required." }, { status: 400 });
  }

  const movie = raw.trim();

  if (movie.length < 1) {
    return NextResponse.json(
      { error: "Movie name is required." },
      { status: 400 },
    );
  }
  if (movie.length > 100) {
    return NextResponse.json(
      { error: "Movie name must be 100 characters or less." },
      { status: 400 },
    );
  }

  const user = await prisma.user.update({
    where: { id: session.userId },
    data: { favorite_movie: movie },
  });

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    profile_url: user.profile_url,
    favorite_movie: user.favorite_movie,
  });
}
