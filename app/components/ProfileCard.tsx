"use client";

import { useState, useRef, useEffect } from "react";
import { api, UserResponse, FactResponse } from "@/app/lib/api";
import { signOut } from "@/app/lib/auth";
import { Pencil, Sparkles, Loader2 } from "lucide-react";
import Image from "next/image";

type CachedFact = {
  data: FactResponse;
  timestamp: number;
  movie: string;
};

const CACHE_TTL = 30_000;

// Avatar component
function Avatar({ src, name }: { src: string | null; name: string }) {
  const [imgError, setImgError] = useState(false);
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (!src || imgError) {
    return (
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-purple-600 text-2xl font-bold text-white shadow-lg">
        {initials}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={name}
      onError={() => setImgError(true)}
      className="h-24 w-24 rounded-full object-cover shadow-lg ring-4 ring-white"
      width={96}
      height={96}
    />
  );
}

// Skeleton loader
function ProfileSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <div className="flex flex-col items-center">
          <div className="h-24 w-24 animate-pulse rounded-full bg-gray-200" />
          <div className="mt-4 h-6 w-32 animate-pulse rounded bg-gray-200" />
          <div className="mt-2 h-4 w-48 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="mt-6 space-y-3">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
          <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="mt-6 h-20 animate-pulse rounded-xl bg-gray-200" />
        <div className="mt-6 h-10 animate-pulse rounded-lg bg-gray-200" />
      </div>
    </div>
  );
}

export function ProfileCard({ user: initialUser }: { user: UserResponse }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [editError, setEditError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [fact, setFact] = useState<FactResponse | null>(null);
  const [factLoading, setFactLoading] = useState(false);
  const [factError, setFactError] = useState("");
  const cachedFact = useRef<CachedFact | null>(null);

  //
  useEffect(() => {
    const timer = setTimeout(() => {
      setUser(initialUser);
      setEditValue(initialUser.favorite_movie ?? "");
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [initialUser]);

  function startEditing() {
    if (!user) return;
    setEditValue(user.favorite_movie ?? "");
    setEditError("");
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
    setEditError("");
  }

  async function saveMovie() {
    if (!user) return;
    const trimmed = editValue.trim();
    if (trimmed.length < 1) {
      setEditError("Movie name is required.");
      return;
    }
    if (trimmed.length > 100) {
      setEditError("Movie name must be 100 characters or less.");
      return;
    }

    setIsSaving(true);
    setEditError("");

    const previousMovie = user.favorite_movie;
    setUser((prev) => (prev ? { ...prev, favorite_movie: trimmed } : prev));
    setIsEditing(false);

    cachedFact.current = null;
    setFact(null);

    try {
      const updated = await api.updateMovie(trimmed);
      setUser(updated);
    } catch (err) {
      setUser((prev) =>
        prev ? { ...prev, favorite_movie: previousMovie } : prev,
      );
      setEditError(err instanceof Error ? err.message : "Failed to save.");
      setIsEditing(true);
      setEditValue(trimmed);
    } finally {
      setIsSaving(false);
    }
  }

  async function fetchFact(forceRefresh = false) {
    if (!user) return;
    if (
      !forceRefresh &&
      cachedFact.current &&
      cachedFact.current.movie === user.favorite_movie &&
      Date.now() - cachedFact.current.timestamp < CACHE_TTL
    ) {
      setFact(cachedFact.current.data);
      return;
    }

    setFactLoading(true);
    setFactError("");

    try {
      const data = await api.getFact();
      cachedFact.current = {
        data,
        timestamp: Date.now(),
        movie: user.favorite_movie ?? "",
      };
      setFact(data);
    } catch (err) {
      setFactError(err instanceof Error ? err.message : "Failed to load fact.");
    } finally {
      setFactLoading(false);
    }
  }

  if (loading || !user) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        {/* Profile */}
        <div className="flex flex-col items-center">
          <Avatar src={user.profile_url} name={user.name} />

          <h2 className="mt-4 text-xl font-bold text-gray-900">{user.name}</h2>
          <p className="text-sm text-gray-400">{user.email}</p>
        </div>

        {/* Movie and Inline Editing  */}
        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Favorite Movie
          </p>

          {isEditing ? (
            <div className="mt-2">
              <input
                type="text"
                value={editValue}
                onChange={(e) => {
                  setEditValue(e.target.value);
                  setEditError("");
                }}
                maxLength={100}
                autoFocus
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
              {editError && (
                <p className="mt-1 text-xs text-red-500">{editError}</p>
              )}
              <div className="mt-2 flex gap-2">
                <button
                  onClick={saveMovie}
                  disabled={isSaving}
                  className="cursor-pointer rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-purple-700 disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={cancelEditing}
                  disabled={isSaving}
                  className="cursor-pointer rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-1 flex items-center gap-2">
              <p className="text-base font-medium text-gray-900">
                {user.favorite_movie}
              </p>
              <button
                onClick={startEditing}
                className="cursor-pointer rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-purple-600"
                title="Edit movie"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Fun fact */}
        <div className="mt-5">
          {factLoading ? (
            <div className="flex flex-col items-center gap-2 rounded-xl bg-linear-to-br from-purple-50 to-pink-50 p-5">
              <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
              <p className="text-xs text-purple-500">
                Generating a fun fact...
              </p>
            </div>
          ) : fact ? (
            <div className="rounded-xl bg-linear-to-br from-purple-50 to-pink-50 p-4">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 text-purple-500">
                  <Sparkles className="h-4 w-4" />
                </span>
                <p className="text-sm leading-relaxed text-gray-700">
                  {fact.fact}
                </p>
              </div>
              <button
                onClick={() => fetchFact(true)}
                className="mt-3 cursor-pointer text-xs font-medium text-purple-500 transition hover:text-purple-700"
              >
                Generate another
              </button>
            </div>
          ) : (
            <button
              onClick={() => fetchFact(true)}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-purple-200 bg-purple-50/50 p-4 text-sm font-medium text-purple-600 transition hover:border-purple-400 hover:bg-purple-50"
            >
              <Sparkles className="h-4 w-4" />
              Generate a fun fact
            </button>
          )}

          {factError && (
            <p className="mt-2 text-xs text-red-500">{factError}</p>
          )}
        </div>

        {/* Sign out */}
        <form action={signOut} className="mt-6">
          <button
            type="submit"
            className="w-full cursor-pointer rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-500 transition hover:bg-gray-50 hover:text-gray-700"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
