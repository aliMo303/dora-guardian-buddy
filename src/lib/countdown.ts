import { useEffect, useState } from "react";

export function formatCountdown(ms: number) {
  const sign = ms < 0 ? "-" : "";
  const abs = Math.abs(ms);
  const h = Math.floor(abs / 3_600_000);
  const m = Math.floor((abs % 3_600_000) / 60_000);
  const s = Math.floor((abs % 60_000) / 1000);
  return `${sign}${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** Ticks down once a second from an initial millisecond value. */
export function useCountdown(initialMs: number | undefined) {
  const [ms, setMs] = useState(initialMs ?? 0);
  useEffect(() => {
    if (initialMs === undefined) return;
    setMs(initialMs);
    const t = setInterval(() => setMs((v) => v - 1000), 1000);
    return () => clearInterval(t);
  }, [initialMs]);
  return ms;
}

/** Ticks down against a fixed deadline (epoch ms). Recomputes each second so it survives remounts. */
export function useCountdownToDeadline(deadline: number | null) {
  const [ms, setMs] = useState(() => (deadline ? deadline - Date.now() : 0));
  useEffect(() => {
    if (deadline === null) return;
    setMs(deadline - Date.now());
    const t = setInterval(() => setMs(deadline - Date.now()), 1000);
    return () => clearInterval(t);
  }, [deadline]);
  return ms;
}
