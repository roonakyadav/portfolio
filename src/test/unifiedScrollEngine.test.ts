import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import { UnifiedScrollEngine } from "@/components/animation/UnifiedScrollEngine";
import { gsap } from "gsap";

const mockLenis = {
  on: vi.fn(),
  off: vi.fn(),
  raf: vi.fn(),
  resize: vi.fn(),
  stop: vi.fn(),
  start: vi.fn(),
};

vi.mock("lenis/react", () => ({
  useLenis: () => mockLenis,
}));

describe("UnifiedScrollEngine", () => {
  it("subscribes to Lenis and GSAP Ticker and unbinds cleanly on unmount", () => {
    const tickerAddSpy = vi.spyOn(gsap.ticker, "add");
    const tickerRemoveSpy = vi.spyOn(gsap.ticker, "remove");

    const { unmount } = render(React.createElement(UnifiedScrollEngine));

    // Assert that single-clock bindings were established
    expect(mockLenis.on).toHaveBeenCalledWith("scroll", expect.any(Function));
    expect(tickerAddSpy).toHaveBeenCalledWith(expect.any(Function));

    // Assert that on unmount, cleanup is cleanly executed
    unmount();
    expect(mockLenis.off).toHaveBeenCalledWith("scroll", expect.any(Function));
    expect(tickerRemoveSpy).toHaveBeenCalledWith(expect.any(Function));
  });
});
