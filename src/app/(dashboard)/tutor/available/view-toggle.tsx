"use client";

import { useState } from "react";

export function ViewToggle({
  listView,
  swipeView,
}: {
  listView: React.ReactNode;
  swipeView: React.ReactNode;
}) {
  const [mode, setMode] = useState<"list" | "swipe">("list");

  return (
    <div>
      {/* Toggle buttons */}
      <div className="flex items-center gap-1 rounded-xl bg-muted p-1 mb-4">
        <button
          onClick={() => setMode("list")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
            mode === "list"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
            <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
          </svg>
          Lista
        </button>
        <button
          onClick={() => setMode("swipe")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
            mode === "swipe"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
          Card
        </button>
      </div>

      {/* Content */}
      {mode === "list" ? listView : swipeView}
    </div>
  );
}
