import { signOut } from "@/app/lib/auth";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <form action={signOut} className="mt-4">
          <button
            type="submit"
            className="cursor-pointer rounded-lg bg-red-500 px-4 py-2 text-sm text-white transition hover:bg-red-600"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
