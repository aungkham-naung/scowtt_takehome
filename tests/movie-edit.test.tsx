import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { ProfileCard } from "@/app/components/ProfileCard";

vi.mock("@/app/lib/api", () => ({
  api: {
    updateMovie: vi.fn(),
    getFact: vi.fn(),
  },
}));

vi.mock("@/app/lib/auth", () => ({
  signOut: vi.fn(),
}));

import { api } from "@/app/lib/api";

const mockUser = {
  id: "1",
  name: "Test User",
  email: "test@test.com",
  profile_url: null,
  favorite_movie: "Parasite",
};

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

function renderAndLoad() {
  render(<ProfileCard user={mockUser} />);
  act(() => {
    vi.advanceTimersByTime(700);
  });
}

describe("Movie edit flow", () => {
  it("displays the current movie", () => {
    renderAndLoad();
    expect(screen.getByText("Parasite")).toBeDefined();
  });

  it("shows edit input when pen icon is clicked", () => {
    renderAndLoad();
    fireEvent.click(screen.getByTitle("Edit movie"));
    expect(screen.getByDisplayValue("Parasite")).toBeDefined();
    expect(screen.getByText("Save")).toBeDefined();
    expect(screen.getByText("Cancel")).toBeDefined();
  });

  it("cancels editing and reverts to display", () => {
    renderAndLoad();
    fireEvent.click(screen.getByTitle("Edit movie"));
    fireEvent.change(screen.getByDisplayValue("Parasite"), {
      target: { value: "Interstellar" },
    });
    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.getByText("Parasite")).toBeDefined();
    expect(screen.getByTitle("Edit movie")).toBeDefined();
  });

  it("shows validation error for empty movie", () => {
    renderAndLoad();
    fireEvent.click(screen.getByTitle("Edit movie"));
    fireEvent.change(screen.getByDisplayValue("Parasite"), {
      target: { value: "   " },
    });
    fireEvent.click(screen.getByText("Save"));
    expect(screen.getByText("Movie name is required.")).toBeDefined();
  });

  it("optimistically updates movie on save", async () => {
    const updateMovie = vi.mocked(api.updateMovie);
    updateMovie.mockResolvedValueOnce({
      ...mockUser,
      favorite_movie: "Interstellar",
    });

    renderAndLoad();
    vi.useRealTimers();

    fireEvent.click(screen.getByTitle("Edit movie"));
    fireEvent.change(screen.getByDisplayValue("Parasite"), {
      target: { value: "Interstellar" },
    });
    fireEvent.click(screen.getByText("Save"));

    expect(screen.getByText("Interstellar")).toBeDefined();

    await waitFor(() => {
      expect(updateMovie).toHaveBeenCalledWith("Interstellar");
    });
  });

  it("reverts movie on save failure", async () => {
    const updateMovie = vi.mocked(api.updateMovie);
    updateMovie.mockRejectedValueOnce(new Error("Server error"));

    renderAndLoad();
    vi.useRealTimers();

    fireEvent.click(screen.getByTitle("Edit movie"));
    fireEvent.change(screen.getByDisplayValue("Parasite"), {
      target: { value: "Interstellar" },
    });
    fireEvent.click(screen.getByText("Save"));

    expect(screen.getByText("Interstellar")).toBeDefined();

    await waitFor(() => {
      expect(screen.getByText("Server error")).toBeDefined();
    });
    expect(screen.getByDisplayValue("Interstellar")).toBeDefined();
  });
});
