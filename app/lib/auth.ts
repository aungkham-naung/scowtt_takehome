"use server";

import { deleteSession, getSession } from "./session";
import { prisma } from "./db";
import { redirect } from "next/navigation";

export async function signOut() {
  await deleteSession();
  redirect("/");
}

export async function saveFavoriteMovie(
  _prevState: { error?: string } | undefined,
  formData: FormData,
) {
  const session = await getSession();
  if (!session) redirect("/");

  const raw = formData.get("movie");
  if (typeof raw !== "string") {
    return { error: "Movie is required." };
  }

  const movie = raw.trim();

  if (movie.length < 1) {
    return { error: "Movie name is required." };
  }
  if (movie.length > 100) {
    return { error: "Movie name must be 100 characters or less." };
  }

  await prisma.user.update({
    where: { id: session.userId },
    data: { favorite_movie: movie },
  });

  redirect("/dashboard");
}
