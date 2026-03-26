"use client";

import { useActionState, useState, useEffect } from "react";
import { saveFavoriteMovie, signOut } from "@/app/lib/auth";

function OnboardingSkeleton() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="h-7 w-32 animate-pulse rounded bg-gray-200" />
        <div className="mt-3 h-4 w-64 animate-pulse rounded bg-gray-200" />
        <div className="mt-8">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
          <div className="mt-2 h-10 w-full animate-pulse rounded-lg bg-gray-200" />
        </div>
        <div className="mt-6 h-10 w-full animate-pulse rounded-lg bg-gray-200" />
        <div className="mt-3 h-8 w-full animate-pulse rounded-lg bg-gray-100" />
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  const [movie, setMovie] = useState("");
  const [clientError, setClientError] = useState("");
  const [loading, setLoading] = useState(true);
  const [serverState, formAction, pending] = useActionState(
    saveFavoriteMovie,
    undefined,
  );

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const trimmed = movie.trim();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setMovie(e.target.value);
    setClientError("");
  }

  function handleSubmit(e: React.FormEvent) {
    if (trimmed.length < 1) {
      e.preventDefault();
      setClientError("Movie name is required.");
      return;
    }
    if (trimmed.length > 100) {
      e.preventDefault();
      setClientError("Movie name must be 100 characters or less.");
      return;
    }
  }

  const error = clientError || serverState?.error;

  if (loading) {
    return <OnboardingSkeleton />;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <h1 className="text-2xl font-bold text-gray-900">Welcome!</h1>
        <p className="mt-2 text-sm text-gray-500">
          Before we get started, tell us your favorite movie.
        </p>

        <form action={formAction} onSubmit={handleSubmit} className="mt-6">
          <label
            htmlFor="movie"
            className="block text-sm font-medium text-gray-700"
          >
            Favorite movie
          </label>
          <input
            id="movie"
            name="movie"
            type="text"
            value={movie}
            onChange={handleChange}
            placeholder="e.g. Parasite"
            maxLength={100}
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
          />
          <div className="mt-1 flex items-center justify-between">
            {error ? <p className="text-sm text-red-500">{error}</p> : <span />}
            <span className="text-xs text-gray-400">{trimmed.length}/100</span>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="mt-4 w-full cursor-pointer rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {pending ? "Saving..." : "Continue"}
          </button>
        </form>

        <form action={signOut} className="mt-3">
          <button
            type="submit"
            className="w-full cursor-pointer rounded-lg px-4 py-2 text-sm text-gray-400 transition hover:text-gray-600"
          >
            Sign out instead
          </button>
        </form>
      </div>
    </div>
  );
}
