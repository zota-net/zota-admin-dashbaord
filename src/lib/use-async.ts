'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface AsyncState<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  refresh: () => void;
  setData: (updater: T | ((prev: T | null) => T)) => void;
}

export function useAsync<T>(
  fn: () => Promise<T>,
  deps: unknown[] = [],
  options: { enabled?: boolean } = {}
): AsyncState<T> {
  const { enabled = true } = options;
  const [data, setDataState] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [nonce, setNonce] = useState(0);
  const fnRef = useRef(fn);
  const cancelledRef = useRef(false);

  useEffect(() => {
    fnRef.current = fn;
  });

  useEffect(() => {
    if (!enabled) return;
    cancelledRef.current = false;
    const run = () => {
      if (cancelledRef.current) return;
      setIsLoading(true);
      setError(null);
      fnRef.current()
        .then((result) => {
          if (!cancelledRef.current) setDataState(result);
        })
        .catch((err: unknown) => {
          if (!cancelledRef.current) {
            setError(err instanceof Error ? err.message : 'Failed to load data');
          }
        })
        .finally(() => {
          if (!cancelledRef.current) setIsLoading(false);
        });
    };
    queueMicrotask(run);
    return () => {
      cancelledRef.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, nonce, ...deps]);

  const refresh = useCallback(() => setNonce((n) => n + 1), []);

  const setData = useCallback((updater: T | ((prev: T | null) => T)) => {
    setDataState((prev) =>
      typeof updater === 'function' ? (updater as (p: T | null) => T)(prev) : updater
    );
  }, []);

  return { data, error, isLoading, refresh, setData };
}
