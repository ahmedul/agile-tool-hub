"use client";

import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

export function usePersistentState<T>(
  key: string,
  initialValue: T,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState(initialValue);
  const hydrated = useRef(false);
  const skipNextWrite = useRef(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved !== null) {
        const parsed = JSON.parse(saved) as T;
        queueMicrotask(() => setValue(parsed));
      }
    } catch {
      // A malformed or unavailable draft should not stop the tool working.
    } finally {
      hydrated.current = true;
      skipNextWrite.current = true;
    }
  }, [key]);

  useEffect(() => {
    if (!hydrated.current || skipNextWrite.current) {
      skipNextWrite.current = false;
      return;
    }
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage can be full or disabled; keep the in-memory tool usable.
    }
  }, [key, value]);

  return [value, setValue];
}
