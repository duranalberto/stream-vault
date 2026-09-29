import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { FRIEND_CODE, Hero } from "./Hero";
import { AppToaster } from "../lib/toast";

describe("Hero", () => {
  it("shows the invitation and friend code, and copies the code", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    render(
      <ChakraProvider value={defaultSystem}>
        <Hero />
        <AppToaster />
      </ChakraProvider>,
    );

    expect(
      screen.getByRole("heading", { name: /welcome to my gameplay vault/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(FRIEND_CODE)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Copy friend code" }));
    expect(writeText).toHaveBeenCalledWith("SW-1950-8874-9689");
    expect(await screen.findByText("Friend code copied")).toBeInTheDocument();
  });
});
