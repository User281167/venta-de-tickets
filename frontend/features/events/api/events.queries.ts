"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchPublishedEvents } from "./events.endpoints";

export function usePublishedEvents() {
  return useQuery({
    queryKey: ["events", "published"],
    queryFn: fetchPublishedEvents,
  });
}
