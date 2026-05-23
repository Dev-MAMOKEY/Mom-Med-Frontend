import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseCountdownOptions {
  autoStart?: boolean;
  onComplete?: () => void;
}

export interface UseCountdownResult {
  remaining: number;
  isRunning: boolean;
  isExpired: boolean;
  start: () => void;
  reset: () => void;
  formatted: string;
}

// "MM:SS" 형식 — "3:00", "0:59"
function format(totalSeconds: number): string {
  const mm = Math.floor(totalSeconds / 60);
  const ss = totalSeconds % 60;
  return `${mm}:${ss.toString().padStart(2, '0')}`;
}

// 지정 초만큼 카운트다운 — 1초 간격 감소, 0 도달 시 onComplete 호출
export function useCountdown(
  seconds: number,
  options?: UseCountdownOptions,
): UseCountdownResult {
  const { autoStart = false, onComplete } = options ?? {};

  const [remaining, setRemaining] = useState(seconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // onComplete 최신 참조 유지 — closure 정착 방지
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clear();
          setIsRunning(false);
          onCompleteRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return clear;
  }, [isRunning, clear]);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const reset = useCallback(() => {
    clear();
    setRemaining(seconds);
    setIsRunning(autoStart);
  }, [seconds, autoStart, clear]);

  return {
    remaining,
    isRunning,
    isExpired: remaining === 0,
    start,
    reset,
    formatted: format(remaining),
  };
}
