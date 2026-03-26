// Response types matching the API routes
export type UserResponse = {
  id: string;
  name: string;
  email: string;
  profile_url: string | null;
  favorite_movie: string | null;
};

export type FactResponse = {
  id: string;
  movie: string;
  fact: string;
  created_at: string;
};

export type ApiError = {
  error: string;
};

// Typed client wrapper
async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);

  if (!res.ok) {
    const body: ApiError = await res.json();
    throw new Error(body.error ?? `Request failed with status ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export const api = {
  getMe: () => request<UserResponse>("/api/me"),

  updateMovie: (movie: string) =>
    request<UserResponse>("/api/me/movie", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ movie }),
    }),

  getFact: () => request<FactResponse>("/api/fact"),
};
