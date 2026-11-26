import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Navigation from "./Navigation";

const usePathnameMock = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => usePathnameMock(),
}));

describe("Navigation", () => {
  beforeEach(() => {
    usePathnameMock.mockReset();
    usePathnameMock.mockReturnValue("/");
  });

  it("renders brand and navigation links to correct routes", () => {
    render(<Navigation />);

    expect(screen.getByRole("navigation", { name: "Main navigation" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /flyrank/i })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: /flyrank/i })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Profile" })).toHaveAttribute("href", "/profile");
    expect(screen.getByRole("link", { name: "Analyze" })).toHaveAttribute("href", "/analyze");
    expect(screen.getByRole("link", { name: "History" })).toHaveAttribute("href", "/history");
    expect(screen.getByRole("link", { name: "Health" })).toHaveAttribute("href", "/health");
  });

  it("marks the active route with aria-current", () => {
    usePathnameMock.mockReturnValue("/analyze");
    render(<Navigation />);

    expect(screen.getByRole("link", { name: "Analyze" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: /flyrank/i })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("link", { name: "Profile" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("link", { name: "History" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("link", { name: "Health" })).not.toHaveAttribute("aria-current");
  });
});
