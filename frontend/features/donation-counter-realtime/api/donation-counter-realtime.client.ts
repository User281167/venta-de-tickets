import type { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/shared/lib/supabase/client";
import type { DonationCounter } from "@/features/donaciones/donation.types";

const TOPIC = "donation-counter:public";

export function subscribeToDonationCounter(
  onUpdate: (counter: DonationCounter) => void,
): () => void {
  const supabase = createClient();

  const channel: RealtimeChannel = supabase
    .channel(TOPIC, { config: { private: true } })
    .on("broadcast", { event: "UPDATE" }, ({ payload }) => {
      const counter = payload as DonationCounter;

      if (
        typeof counter.currentValue === "number" &&
        typeof counter.metaValue === "number" &&
        typeof counter.updatedAt === "string"
      ) {
        onUpdate(counter);
      }
    })
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
