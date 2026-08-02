"use client";

import { useMemo, useState } from "react";
import type { AnalyticsDateRange } from "../schemas/analytics.schema";

export function defaultRange(days = 30): AnalyticsDateRange {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

export function useDateRange(initialDays = 30) {
  const [range, setRange] = useState<AnalyticsDateRange>(() =>
    defaultRange(initialDays),
  );

  const api = useMemo(
    () => ({
      range,
      setRange,
      reset: () => setRange(defaultRange(initialDays)),
    }),
    [range, initialDays],
  );

  return api;
}
