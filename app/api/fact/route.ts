import { NextResponse } from "next/server";
import { getSession } from "@/app/lib/session";
import { prisma } from "@/app/lib/db";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // get user data
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  // guard clause to check if the user has a favorite movie although this should not be possible since the user is redirected to the onboarding page if they don't have a favorite movie
  if (!user?.favorite_movie) {
    return NextResponse.json(
      { error: "No favorite movie set." },
      { status: 400 },
    );
  }

  // generate the fact using the OpenAI API
  let fact: string;
  try {
    const generatedFact = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You will receive a movie title. Respond with one short, fun, surprising fact about that movie in 1-2 sentences. If the input is not a recognizable movie, make up a plausible-sounding fun fact anyway. Do not ask any clarifying questions.",
        },
        {
          role: "user",
          content: user.favorite_movie,
        },
      ],
    });

    fact =
      generatedFact.choices[0]?.message?.content?.trim() ??
      "We couldn't generate a fact for this movie.";
  } catch {
    return NextResponse.json(
      { error: "Failed to generate fact. Please try again later." },
      { status: 502 },
    );
  }

  // save the fact to the database
  const savedFact = await prisma.fact.create({
    data: {
      user_id: user.id,
      movie: user.favorite_movie,
      fact,
    },
  });

  return NextResponse.json({
    id: savedFact.id,
    movie: savedFact.movie,
    fact: savedFact.fact,
    created_at: savedFact.created_at.toISOString(),
  });
}
