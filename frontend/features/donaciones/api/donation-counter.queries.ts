import { useQuery } from "@tanstack/react-query";
import { DonationCounter } from "../donation.types";

async function fetchDonationCounter(): Promise<DonationCounter> {
  const response = await fetch("/api/donaciones/counter", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("No se pudo cargar el contador de donaciones");
  }

  return response.json();
}

export function useDonationCounter() {
  return useQuery({
    queryKey: ["donation", "counter"],
    queryFn: fetchDonationCounter,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
    refetchOnWindowFocus: true,
  });
}
