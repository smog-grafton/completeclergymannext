"use client";

import { useState } from "react";
import { postPublicApi } from "@/lib/publicApi";

export function PrayerButton({ prayerId, initialCount }: { prayerId: number; initialCount: number }) {
  const [hasPrayed, setHasPrayed] = useState(false);
  const [count, setCount] = useState(initialCount);

  async function pray() {
    try {
      const response = await postPublicApi<{ data: { prayerCount: number } }>("/prayer-requests/" + prayerId + "/pray", {});
      setCount(response.data.prayerCount);
      setHasPrayed(true);
    } catch {
      // The action remains available so a temporary network error does not look like a completed prayer.
    }
  }

  return <button className="button--quiet" type="button" disabled={hasPrayed} onClick={pray}>{hasPrayed ? "Prayed · " + count : "I prayed for this · " + count}</button>;
}
