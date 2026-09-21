import { useEffect, useState } from "react";
import { ApiError } from "../api/client";

export function useNow() {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  return Math.max(now, Date.now());
}

export function useRetryCooldown() {
  const now = useNow();
  const [until, setUntil] = useState(0);
  const record = (error: unknown) => {
    if (error instanceof ApiError && error.status === 429 && error.retryAfterSeconds !== null) {
      setUntil(Date.now() + error.retryAfterSeconds * 1000);
    }
  };
  return { seconds: Math.max(0, Math.ceil((until - now) / 1000)), record };
}
