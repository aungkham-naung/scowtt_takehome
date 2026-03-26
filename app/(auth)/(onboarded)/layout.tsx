import { redirect } from "next/navigation";
import { getSession } from "@/app/lib/session";
import { prisma } from "@/app/lib/db";

// layout to handle onboarding redirect for new users
export default async function OnboardedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  if (!user?.favorite_movie) {
    redirect("/onboarding");
  }

  return <>{children}</>;
}
