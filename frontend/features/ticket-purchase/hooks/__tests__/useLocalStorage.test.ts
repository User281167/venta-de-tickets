import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLocalStorage, readValue } from "../useLocalStorage";

const STORAGE_KEY = "test-key";

describe("useLocalStorage", () => {
  beforeEach(() => {
    vi.stubGlobal("window", {
      localStorage: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns initial value when localStorage is empty", () => {
    vi.mocked(window.localStorage.getItem).mockReturnValue(null);

    const { result } = renderHook(() => useLocalStorage(STORAGE_KEY, "default"));

    expect(result.current[0]).toBe("default");
  });

  it("returns parsed value when localStorage has data", () => {
    vi.mocked(window.localStorage.getItem).mockReturnValue(JSON.stringify("stored"));

    const { result } = renderHook(() => useLocalStorage(STORAGE_KEY, "default"));

    expect(result.current[0]).toBe("stored");
  });

  it("falls back to initial value on corrupt JSON", () => {
    vi.mocked(window.localStorage.getItem).mockReturnValue("{invalid");

    const { result } = renderHook(() => useLocalStorage(STORAGE_KEY, "default"));

    expect(result.current[0]).toBe("default");
  });

  it("writes to localStorage when value changes", () => {
    vi.mocked(window.localStorage.getItem).mockReturnValue(null);

    const { result } = renderHook(() => useLocalStorage(STORAGE_KEY, "initial"));

    act(() => {
      result.current[1]("updated");
    });

    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      STORAGE_KEY,
      JSON.stringify("updated"),
    );
  });

  it("handles SSR — no window object", () => {
    const result = readValue(STORAGE_KEY, "ssr-safe");
    expect(result).toBe("ssr-safe");
  });
});
