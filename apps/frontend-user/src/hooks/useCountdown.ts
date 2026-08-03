import { useCallback, useEffect, useMemo, useState } from "react";

export const useCountdown = (initialSeconds: number) => {
  const initialDuration = Math.max(0, Math.floor(initialSeconds));
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(initialDuration);
  const [isExpired, setIsExpired] = useState(initialDuration === 0);

  useEffect(() => {
    if (expiresAt === null) return;

    const updateRemaining = () => {
      const nextRemainingSeconds = Math.max(
        0,
        Math.ceil((expiresAt - Date.now()) / 1000),
      );

      setRemainingSeconds(nextRemainingSeconds);

      if (nextRemainingSeconds === 0) {
        setExpiresAt(null);
        setIsExpired(true);
      }
    };

    updateRemaining();

    const timer = window.setInterval(updateRemaining, 1000);

    return () => window.clearInterval(timer);
  }, [expiresAt]);

  const reset = useCallback(
    (seconds = initialSeconds) => {
      const duration = Math.max(0, Math.floor(seconds));

      if (duration === 0) {
        setRemainingSeconds(0);
        setIsExpired(true);
        setExpiresAt(null);
        return;
      }

      setRemainingSeconds(duration);
      setIsExpired(false);
      setExpiresAt(Date.now() + duration * 1000);
    },
    [initialSeconds],
  );

  const stop = useCallback(() => {
    setExpiresAt(null);
    setRemainingSeconds(0);
    setIsExpired(false);
  }, []);

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
