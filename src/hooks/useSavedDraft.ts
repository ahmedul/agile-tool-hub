"use client";

import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from "react";

interface DraftSchema<T> {
  safeParse(value: unknown): { success: true; data: T } | { success: false };
}

export interface SavedDraftControls {
  status: "loading" | "ready" | "saved" | "unavailable";
  recovered: boolean;
  clearFailed: boolean;
  reset: () => void;
  retry: () => void;
}

interface DraftState<T> {
  key: string;
  value: T;
  revision: number;
  status: SavedDraftControls["status"];
  recovered: boolean;
  clearFailed: boolean;
}

export function useSavedDraft<T>(key: string, initialValue: T, schema: DraftSchema<T>): [T, Dispatch<SetStateAction<T>>, SavedDraftControls] {
  const defaults = useRef(initialValue);
  const validator = useRef(schema);
  const [state, setState] = useState<DraftState<T>>({
    key, value: initialValue, revision: 0, status: "loading", recovered: false, clearFailed: false,
  });
  const current = useRef(state);

  const load = useCallback(() => {
    // A delayed restore must never replace an edit made during hydration.
    if (current.current.key === key && current.current.revision > 0) return;
    let value = defaults.current;
    let status: SavedDraftControls["status"] = "ready";
    let recovered = false;
    try {
      const saved = localStorage.getItem(key);
      if (saved !== null) {
        try {
          const parsed = validator.current.safeParse(JSON.parse(saved));
          if (!parsed.success) throw new Error("Invalid saved draft");
          value = parsed.data;
          status = "saved";
        } catch {
          recovered = true;
          localStorage.removeItem(key);
        }
      }
    } catch {
      status = "unavailable";
    }
    const restored = { key, value, revision: 0, status, recovered, clearFailed: recovered && status === "unavailable" };
    current.current = restored;
    setState(restored);
  }, [key]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => { if (!cancelled) load(); });
    return () => { cancelled = true; };
  }, [load]);

  const setValue = useCallback<Dispatch<SetStateAction<T>>>(next => {
    const previous = current.current;
    const value = typeof next === "function" ? (next as (value: T) => T)(previous.value) : next;
    let status: SavedDraftControls["status"] = "saved";
    // Persist inside the event handler, so an immediate refresh cannot lose an
    // edit waiting for a passive effect. Keep storage work out of React updaters.
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      status = "unavailable";
    }
    const updated = { ...previous, key, value, revision: previous.revision + 1, status, clearFailed: false };
    current.current = updated;
    setState(updated);
  }, [key]);

  const reset = useCallback(() => {
    let status: SavedDraftControls["status"] = "ready";
    try {
      localStorage.removeItem(key);
    } catch {
      status = "unavailable";
    }
    const cleared = {
      key, value: defaults.current, revision: current.current.revision + 1,
      status, recovered: false, clearFailed: status === "unavailable",
    };
    current.current = cleared;
    setState(cleared);
  }, [key]);

  const retry = useCallback(() => {
    const draft = current.current;
    if (draft.clearFailed) reset();
    else if (draft.revision === 0) load();
    else setValue(draft.value);
  }, [load, reset, setValue]);

  return [state.value, setValue, { status: state.status, recovered: state.recovered, clearFailed: state.clearFailed, reset, retry }];
}
