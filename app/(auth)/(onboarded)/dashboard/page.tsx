import { getSession } from "@/app/lib/session";
import { prisma } from "@/app/lib/db";
import { redirect } from "next/navigation";
import { ProfileCard } from "@/app/components/ProfileCard";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  if (!user) redirect("/");

  return (
    <ProfileCard
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        profile_url: user.profile_url,
        favorite_movie: user.favorite_movie,
      }}
    />
  );
}
