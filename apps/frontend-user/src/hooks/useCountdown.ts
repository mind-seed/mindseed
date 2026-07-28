import { useCallback, useEffect, useMemo, useState } from "react";

export const useCountdown = (initialSeconds: number) => {
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isExpired, setIsExpired] = useState(false);

  const reset = useCallback(
    (seconds = initialSeconds) => {
      const duration = Math.max(0, Math.floor(seconds));

      setRemainingSeconds(duration);
      setIsExpired(duration === 0);
      setExpiresAt(duration > 0 ? Date.now() + duration * 1000 : null);
    },
    [initialSeconds],
  );

  const stop = useCallback(() => {
    setExpiresAt(null);
    setRemainingSeconds(0);
    setIsExpired(false);
  }, []);

  useEffect(() => {
    if (expiresAt === null) return;

    const timer = window.setInterval(() => {
      const nextRemainingSeconds = Math.max(
        0,
        Math.ceil((expiresAt - Date.now()) / 1000),
      );

      setRemainingSeconds(nextRemainingSeconds);

      if (nextRemainingSeconds === 0) {
        setExpiresAt(null);
        setIsExpired(true);
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [expiresAt]);

  const formattedTime = useMemo(() => {
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, [remainingSeconds]);

  return {
    remainingSeconds,
    formattedTime,
    isExpired,
    isRunning: expiresAt !== null && remainingSeconds > 0,
    reset,
    stop,
  };
};
