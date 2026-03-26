import Image from "next/image";

export default function RootPage() {
  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gray-900">
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-1 opacity-40">
          <div className="bg-purple-900" />
          <div className="bg-blue-900" />
          <div className="bg-indigo-900" />
          <div className="bg-pink-900" />
          <div className="bg-violet-900" />
          <div className="bg-blue-800" />
          <div className="bg-indigo-800" />
          <div className="bg-purple-800" />
          <div className="bg-pink-800" />
        </div>
      </div>

      {/* Sign In */}
      <div className="flex w-full flex-col items-center justify-center bg-white px-8 lg:w-1/2">
        <div className="w-full max-w-sm text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Welcome back
          </h2>

          <div className="mt-4">
            <a href="/api/auth/google">
              <button className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-6 py-3.5 text-md font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 hover:shadow-md">
                <Image
                  src="https://www.google.com/favicon.ico"
                  alt="Google"
                  width={24}
                  height={24}
                />
                Continue with Google
              </button>
            </a>
          </div>

          <p className="mt-4 text-center text-xs text-gray-400">
            By signing in, you agree to let us store your name, email, and
            profile photo from Google.
          </p>
        </div>
      </div>
    </div>
  );
}
