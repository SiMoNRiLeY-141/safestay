import React from "react";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";

function TestConsumer() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={toggleTheme}>Toggle</button>
    </div>
  );
}

describe("ThemeContext", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
    (window.matchMedia as jest.Mock).mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
  });

  it("defaults to light theme when no stored preference", () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );
    expect(screen.getByTestId("theme")).toHaveTextContent("light");
  });

  it("toggles from light to dark on button click", async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );
    await user.click(screen.getByRole("button", { name: "Toggle" }));
    expect(screen.getByTestId("theme")).toHaveTextContent("dark");
  });

  it("toggles back from dark to light", async () => {
    localStorage.setItem("theme", "dark");
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );
    await user.click(screen.getByRole("button", { name: "Toggle" }));
    expect(screen.getByTestId("theme")).toHaveTextContent("light");
  });

  it("persists theme to localStorage on toggle", async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );
    await user.click(screen.getByRole("button", { name: "Toggle" }));
    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("adds dark class to documentElement when switching to dark", async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );
    await user.click(screen.getByRole("button", { name: "Toggle" }));
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("removes dark class from documentElement when switching to light", async () => {
    localStorage.setItem("theme", "dark");
    document.documentElement.classList.add("dark");
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );
    await user.click(screen.getByRole("button", { name: "Toggle" }));
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("reads dark theme from localStorage on mount", () => {
    localStorage.setItem("theme", "dark");
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );
    expect(screen.getByTestId("theme")).toHaveTextContent("dark");
  });

  it("respects system dark preference when no localStorage entry exists", () => {
    (window.matchMedia as jest.Mock).mockImplementation((query: string) => ({
      matches: query === "(prefers-color-scheme: dark)",
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );
    expect(screen.getByTestId("theme")).toHaveTextContent("dark");
  });

  it("throws when useTheme is called outside ThemeProvider", () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    function BrokenConsumer() {
      useTheme();
      return null;
    }
    expect(() => render(<BrokenConsumer />)).toThrow(
      "useTheme must be used within a ThemeProvider"
    );
    errorSpy.mockRestore();
  });
});
