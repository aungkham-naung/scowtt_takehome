import { describe, it, expect, vi, beforeEach } from "vitest";
import { api } from "@/app/lib/api";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

beforeEach(() => {
  mockFetch.mockReset();
});

describe("API client", () => {
  describe("getMe", () => {
    it("returns user data on success", async () => {
      const user = {
        id: "1",
        name: "Test User",
        email: "test@test.com",
        profile_url: null,
        favorite_movie: "Parasite",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => user,
      });

      const result = await api.getMe();
      expect(result).toEqual(user);
      expect(mockFetch).toHaveBeenCalledWith("/api/me", undefined);
    });

    it("throws on 401 unauthorized", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Unauthorized" }),
      });

      await expect(api.getMe()).rejects.toThrow("Unauthorized");
    });

    it("throws on 500 server error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Internal server error" }),
      });

      await expect(api.getMe()).rejects.toThrow("Internal server error");
    });
  });

  describe("updateMovie", () => {
    it("sends PUT with movie in body", async () => {
      const user = {
        id: "1",
        name: "Test User",
        email: "test@test.com",
        profile_url: null,
        favorite_movie: "Interstellar",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => user,
      });

      const result = await api.updateMovie("Interstellar");
      expect(result).toEqual(user);
      expect(mockFetch).toHaveBeenCalledWith("/api/me/movie", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movie: "Interstellar" }),
      });
    });

    it("throws on 400 validation error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Movie name is required." }),
      });

      await expect(api.updateMovie("")).rejects.toThrow(
        "Movie name is required.",
      );
    });

    it("throws on 401 unauthorized", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Unauthorized" }),
      });

      await expect(api.updateMovie("Test")).rejects.toThrow("Unauthorized");
    });
  });

  describe("getFact", () => {
    it("returns fact on success", async () => {
      const fact = {
        id: "1",
        movie: "Parasite",
        fact: "A fun fact",
        created_at: "2026-03-26T00:00:00.000Z",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => fact,
      });

      const result = await api.getFact();
      expect(result).toEqual(fact);
    });

    it("throws on 502 when OpenAI fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: "Failed to generate fact. Please try again later.",
        }),
      });

      await expect(api.getFact()).rejects.toThrow(
        "Failed to generate fact. Please try again later.",
      );
    });
  });
});
