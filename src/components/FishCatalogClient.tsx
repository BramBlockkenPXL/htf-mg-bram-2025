"use client";

import { useEffect, useMemo, useState } from "react";
import { Fish } from "@/types/fish";
import CatalogFishCard from "./CatalogFishCard";

interface FishCatalogClientProps {
  fishes: Fish[];
}

const STORAGE_KEY = "seenFishIds";

function readSeenArray(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch (e) {
    return [];
  }
}

export default function FishCatalogClient({ fishes }: FishCatalogClientProps) {
  const [filter, setFilter] = useState<"all" | "seen" | "unseen">("all");
  const [query, setQuery] = useState("");
  const [seenIds, setSeenIds] = useState<string[]>(() => readSeenArray());

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setSeenIds(readSeenArray());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const onToggleSeen = (id: string, seen: boolean) => {
    setSeenIds((prev) => {
      const set = new Set(prev);
      if (seen) set.add(id); else set.delete(id);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set))); } catch (e) {}
      // also trigger storage event for same-tab listeners
      window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
      return Array.from(set);
    });
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return fishes.filter((f) => {
      if (filter === "seen" && !seenIds.includes(f.id)) return false;
      if (filter === "unseen" && seenIds.includes(f.id)) return false;
      if (q && !f.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [fishes, filter, query, seenIds]);

  const stats = useMemo(() => ({
    total: fishes.length,
    seen: seenIds.length,
    unseen: fishes.length - seenIds.length,
  }), [fishes.length, seenIds.length]);

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-panel-border flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-sonar-green font-mono">Fish Species Catalog</h2>
          <div className="text-xs text-text-secondary">Browse all known species and manage sightings</div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-text-secondary mr-2">Filter:</div>
          <div className="flex gap-2">
            {(["all", "seen", "unseen"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 text-xs rounded font-mono font-bold ${filter===f ? "bg-sonar-green text-dark-navy" : "bg-[color-mix(in_srgb,var(--color-dark-navy)_85%,transparent)] border border-panel-border text-sonar-green"}`}
              >{f.toUpperCase()}</button>
            ))}
          </div>

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search species..."
            className="ml-4 px-3 py-1 bg-[color-mix(in_srgb,var(--color-dark-navy)_90%,transparent)] border border-panel-border rounded text-sm font-mono"
          />
        </div>
      </div>

      <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto" style={{height: 'calc(100vh - 140px)'}}>
        {filtered.map((fish) => (
          <CatalogFishCard key={fish.id} fish={fish} onToggleSeen={onToggleSeen} />
        ))}
      </div>

      <div className="px-6 py-3 border-t border-panel-border text-xs text-text-secondary font-mono flex items-center justify-between">
        <div>Showing {filtered.length} of {fishes.length} species</div>
        <div className="flex gap-4">
          <div>TOTAL: <span className="text-sonar-green font-bold ml-1">{stats.total}</span></div>
          <div>SPOTTED: <span className="text-warning-amber font-bold ml-1">{stats.seen}</span></div>
          <div>UNSEEN: <span className="text-sonar-green font-bold ml-1">{stats.unseen}</span></div>
        </div>
      </div>
    </div>
  );
}
