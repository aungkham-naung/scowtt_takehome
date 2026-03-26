import Image from "next/image";

const RootPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black/30">
      <div className="rounded-2xl bg-white p-10 shadow-xl backdrop-blur-sm">
        <a href="/api/auth/google">
          <button className="cursor-pointer flex items-center gap-3 rounded-lg border border-gray-300 px-6 py-3 text-gray-700 transition hover:bg-gray-50 hover:shadow-md">
            <Image
              src="https://www.google.com/favicon.ico"
              alt="Google"
              width={20}
              height={20}
            />
            <span>Sign in with Google</span>
          </button>
        </a>
      </div>
    </div>
  );
};

export default RootPage;
