import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import ProfilePage from "./page";

const STORAGE_KEY = "aiCareerCopilot.careerProfile.v1";

const savedProfile = {
  fullName: "Ada Lovelace",
  email: "ada@example.com",
  targetRole: "Software Engineer",
  experienceLevel: "Mid-level",
  workArrangement: "Hybrid",
  skills: "TypeScript, React",
};

describe("ProfilePage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders expected form fields after loading", async () => {
    render(<ProfilePage />);

    expect(await screen.findByRole("heading", { name: "Career Profile Settings" })).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/target job role/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/experience level/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/preferred work arrangement/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/skills and interests/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save profile" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reset" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete saved data" })).toBeInTheDocument();
  });

  it("associates validation errors with fields and focuses the first invalid field", async () => {
    const user = userEvent.setup();
    render(<ProfilePage />);
    await screen.findByRole("heading", { name: "Career Profile Settings" });

    await user.click(screen.getByRole("button", { name: "Save profile" }));

    const invalidFields = [
      {
        label: /full name/i,
        errorId: "profile-fullName-error",
        message: "Enter your full name.",
      },
      {
        label: /email address/i,
        errorId: "profile-email-error",
        message: "Enter your email address.",
      },
      {
        label: /target job role/i,
        errorId: "profile-targetRole-error",
        message: "Enter your target job role.",
      },
      {
        label: /experience level/i,
        errorId: "profile-experienceLevel-error",
        message: "Select your experience level.",
      },
      {
        label: /preferred work arrangement/i,
        errorId: "profile-workArrangement-error",
        message: "Select your preferred work arrangement.",
      },
    ];

    for (const field of invalidFields) {
      const input = screen.getByLabelText(field.label);
      expect(input).toBeRequired();
      expect(input).toHaveAttribute("aria-invalid", "true");
      expect(input).toHaveAttribute("aria-describedby", field.errorId);
      expect(document.getElementById(field.errorId)).toHaveTextContent(field.message);
    }

    expect(screen.getByLabelText(/skills and interests/i)).not.toBeRequired();
    expect(screen.getByLabelText(/full name/i)).toHaveFocus();
  });

  it("loads existing valid profile data from localStorage", async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedProfile));
    render(<ProfilePage />);

    expect(await screen.findByLabelText(/full name/i)).toHaveValue("Ada Lovelace");
    expect(screen.getByLabelText(/email address/i)).toHaveValue("ada@example.com");
    expect(screen.getByLabelText(/target job role/i)).toHaveValue("Software Engineer");
    expect(screen.getByLabelText(/experience level/i)).toHaveValue("Mid-level");
    expect(screen.getByLabelText(/preferred work arrangement/i)).toHaveValue("Hybrid");
    expect(screen.getByLabelText(/skills and interests/i)).toHaveValue("TypeScript, React");
  });

  it("updates values, validates, and saves normalized profile to localStorage", async () => {
    const user = userEvent.setup();
    render(<ProfilePage />);
    await screen.findByLabelText(/full name/i);

    await user.click(screen.getByRole("button", { name: "Save profile" }));

    expect(await screen.findByText("Please correct the highlighted fields before saving.")).toBeInTheDocument();
    expect(screen.getByText("Enter your full name.")).toBeInTheDocument();
    expect(screen.getByText("Enter your email address.")).toBeInTheDocument();

    await user.type(screen.getByLabelText(/full name/i), "  Ada Lovelace  ");
    await user.type(screen.getByLabelText(/email address/i), " ada@example.com ");
    await user.type(screen.getByLabelText(/target job role/i), " Software Engineer ");
    await user.selectOptions(screen.getByLabelText(/experience level/i), "Mid-level");
    await user.selectOptions(screen.getByLabelText(/preferred work arrangement/i), "Hybrid");
    await user.type(screen.getByLabelText(/skills and interests/i), " TypeScript ");

    await user.click(screen.getByRole("button", { name: "Save profile" }));

    expect(await screen.findByText("Career profile saved successfully.")).toBeInTheDocument();
    await waitFor(() => {
      expect(JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")).toEqual({
        fullName: "Ada Lovelace",
        email: "ada@example.com",
        targetRole: "Software Engineer",
        experienceLevel: "Mid-level",
        workArrangement: "Hybrid",
        skills: "TypeScript",
      });
    });
  });

  it("resets to last saved profile and reports status", async () => {
    const user = userEvent.setup();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedProfile));
    render(<ProfilePage />);

    const nameInput = await screen.findByLabelText(/full name/i);
    await user.clear(nameInput);
    await user.type(nameInput, "Grace Hopper");

    await user.click(screen.getByRole("button", { name: "Reset" }));

    expect(screen.getByLabelText(/full name/i)).toHaveValue("Ada Lovelace");
    expect(screen.getByText("Form restored to the last saved profile.")).toBeInTheDocument();
  });

  it("deletes saved profile data from localStorage", async () => {
    const user = userEvent.setup();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedProfile));
    render(<ProfilePage />);

    expect(await screen.findByLabelText(/full name/i)).toHaveValue("Ada Lovelace");

    await user.click(screen.getByRole("button", { name: "Delete saved data" }));

    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(screen.getByLabelText(/full name/i)).toHaveValue("");
    expect(
      screen.getByText("Saved profile data deleted from this browser.")
    ).toBeInTheDocument();
  });
});
