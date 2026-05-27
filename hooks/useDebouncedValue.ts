import { useEffect, useState } from 'react';

// 입력 값이 delay(ms) 동안 변하지 않을 때만 갱신되는 디바운스 훅 — 검색 입력 디바운싱 등에 사용
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return debounced;
}
