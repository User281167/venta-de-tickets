import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CampaignVideo } from "../CampaignVideo";

let intersectionCallback: IntersectionObserverCallback;
const disconnect = vi.fn();

class TestIntersectionObserver {
  constructor(callback: IntersectionObserverCallback) {
    intersectionCallback = callback;
  }

  observe = vi.fn();
  disconnect = disconnect;
  unobserve = vi.fn();

}

function setVisible(isIntersecting: boolean) {
  intersectionCallback(
    [{ isIntersecting } as IntersectionObserverEntry],
    {} as IntersectionObserver,
  );
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  disconnect.mockClear();
});

describe("CampaignVideo", () => {
  it("loops muted while visible and pauses outside the viewport", () => {
    vi.stubGlobal("IntersectionObserver", TestIntersectionObserver);
    const play = vi
      .spyOn(HTMLMediaElement.prototype, "play")
      .mockResolvedValue(undefined);
    const pause = vi
      .spyOn(HTMLMediaElement.prototype, "pause")
      .mockImplementation(() => {});

    const { getByLabelText, unmount } = render(<CampaignVideo />);
    const video = getByLabelText(
      "Video promocional de La U del Futuro 2026 y UTPton",
    ) as HTMLVideoElement;

    expect(video.muted).toBe(true);
    expect(video.loop).toBe(true);
    setVisible(true);
    expect(play).toHaveBeenCalledOnce();

    setVisible(false);
    expect(pause).toHaveBeenCalledOnce();

    unmount();
    expect(disconnect).toHaveBeenCalledOnce();
  });
});
