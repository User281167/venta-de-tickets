"use client";

import { useState, useCallback, useEffect } from "react";

export function readValue<T>(key: string, initialValue: T): T {
  if (typeof window === "undefined") {
    return initialValue;
  }

  try {
    const raw = window.localStorage.getItem(key);

    if (raw === null) return initialValue;

    return JSON.parse(raw) as T;
  } catch {
    return initialValue;
  }
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() =>
    readValue(key, initialValue),
  );

  const setValue = useCallback((value: T) => {
    setStoredValue(value);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch {
      // Storage full or unavailable — silently ignore
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}
