"use client";

import { useCallback, useRef, useState } from "react";
import type { SavedDraftControls } from "@/hooks/useSavedDraft";

export default function DraftActions({ drafts, onReset }: { drafts: SavedDraftControls[]; onReset: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const [cleared, setCleared] = useState(false);
  const startButton = useRef<HTMLButtonElement>(null);
  const focusClearButton = useCallback((element: HTMLButtonElement | null) => { element?.focus(); }, []);
  const loading = drafts.some(draft => draft.status === "loading");
  const unavailable = drafts.some(draft => draft.status === "unavailable");
  const saved = drafts.some(draft => draft.status === "saved");
  const recovered = drafts.some(draft => draft.recovered);
  const clearFailed = drafts.some(draft => draft.clearFailed);

  let message = "Drafts save in this browser as you work.";
  if (loading) message = "Loading saved draft…";
  else if (unavailable) message = clearFailed
    ? "Fields cleared for this visit. Browser storage could not be cleared; an earlier draft may return after a refresh."
    : "Browser storage is unavailable. Changes are kept for this visit only. Copy or download your result before leaving.";
  else if (saved) message = "Saved in this browser.";
  else if (cleared) message = "Draft cleared. Ready to start again.";

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p role="status" className="min-w-0 flex-1 basis-48">{message}</p>
        <div className="flex flex-wrap gap-2">
          {unavailable && (
            <button type="button" onClick={() => drafts.filter(draft => draft.status === "unavailable").forEach(draft => draft.retry())} className="rounded border border-gray-300 bg-white px-3 py-2 font-medium hover:bg-gray-100">
              Retry saving
            </button>
          )}
          <button ref={startButton} type="button" disabled={loading} onClick={() => setConfirming(true)} className="rounded border border-gray-300 bg-white px-3 py-2 font-medium hover:bg-gray-100 disabled:opacity-50">
            Start over
          </button>
        </div>
      </div>
      {recovered && <p className="mt-2 text-amber-800">An invalid saved value was reset. Other saved values were kept.</p>}
      {confirming && (
        <div className="mt-3 border-t border-gray-200 pt-3">
          <p>Clear this tool’s saved inputs and generated result?</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" ref={focusClearButton} onClick={() => {
              drafts.forEach(draft => draft.reset());
              setConfirming(false);
              setCleared(true);
              onReset();
            }} className="rounded bg-blue-700 px-3 py-2 font-medium text-white hover:bg-blue-800">Clear draft</button>
            <button type="button" onClick={() => { setConfirming(false); startButton.current?.focus(); }} className="rounded border border-gray-300 bg-white px-3 py-2 hover:bg-gray-100">Keep editing</button>
          </div>
        </div>
      )}
    </div>
  );
}
