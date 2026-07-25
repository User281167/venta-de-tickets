"use client";

import { useEffect, useState } from "react";

type RevealOptions = {
  delay?: number;
  rootMargin?: string;
};

export function useRevealAll(options: RevealOptions = {}): void {
  const { delay = 60, rootMargin = "0px 0px -10% 0px" } = options;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(".reveal"),
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const index = Number(el.dataset.revealIndex ?? 0);
            window.setTimeout(() => {
              el.classList.add("in");
            }, index * delay);
            observer.unobserve(el);
          }
        });
      },
      { rootMargin, threshold: 0.05 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [delay, rootMargin]);
}
