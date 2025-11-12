"use client";

import { useEffect, useState } from "react";
import { Fish } from "@/types/fish";
import { formatDistanceToNow } from "date-fns";
import { getRarityBadgeClass } from "@/utils/rarity";

interface CatalogFishCardProps {
  fish: Fish;
  onToggleSeen?: (id: string, seen: boolean) => void;
}

const STORAGE_KEY = "seenFishIds";

function readSeenSet(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch (e) {
    return new Set();
  }
}

function writeSeenSet(set: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
  } catch (e) {
    // ignore
  }
}

export default function CatalogFishCard({ fish, onToggleSeen }: CatalogFishCardProps) {
  const [isSeen, setIsSeen] = useState(false);
  const [justToggled, setJustToggled] = useState(false);
  const [lastSeen, setLastSeen] = useState(fish.latestSighting?.timestamp ?? null);

  useEffect(() => {
  const set = readSeenSet();
  setIsSeen(set.has(fish.id));

  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      const s = readSeenSet();
      setIsSeen(s.has(fish.id)); // ❌ this line causes the warning
    }
  };

  window.addEventListener("storage", onStorage);
  return () => window.removeEventListener("storage", onStorage);
}, [fish.id]);

  const toggleSeen = async () => {
    const set = readSeenSet();

    if (set.has(fish.id)) {
      set.delete(fish.id);
      setIsSeen(false);
      onToggleSeen?.(fish.id, false);
    } else {
      set.add(fish.id);
      setIsSeen(true);
      onToggleSeen?.(fish.id, true);

      // 🔁 Update last seen timestamp in the database via the API
      try {
        const res = await fetch(`/api/fish-sightings/${fish.id}/timestamp`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ timestamp: new Date().toISOString() }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.timestamp) {
            setLastSeen(data.timestamp);
          }
        } else {
          console.error("Failed to update timestamp:", res.status);
        }
      } catch (err) {
        console.error("Failed to update last seen timestamp", err);
      }
    }

    writeSeenSet(set);
    window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));

    setJustToggled(true);
    window.setTimeout(() => setJustToggled(false), 900);
  };

  return (
    <div className="h-full max-h-[420px] flex flex-col justify-between rounded-lg overflow-hidden border border-panel-border shadow-[--shadow-cockpit-border] transition-all">
      {justToggled && (
        <div className="absolute inset-0 bg-sonar-green/10 flex items-center justify-center z-20 pointer-events-none animate-fade">
          <div className="px-3 py-1 rounded bg-dark-navy border border-panel-border text-sm font-mono">
            {isSeen ? "Marked as spotted" : "Marked as unseen"}
          </div>
        </div>
      )}

      <div className="p-3 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="text-sm font-bold text-text-primary">{fish.name}</div>
            <div className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mt-1 ${getRarityBadgeClass(fish.rarity)}`}>
              {fish.rarity}
            </div>
          </div>

          <button
            onClick={toggleSeen}
            className={`text-xs font-mono px-3 py-1 rounded border font-bold transition-all duration-200 ease-out hover:scale-[1.03]
              ${isSeen
                ? "bg-warning-amber text-dark-navy border-warning-amber hover:bg-warning-amber/90"
                : "bg-dark-navy text-sonar-green border-panel-border hover:bg-dark-navy/80 hover:border-sonar-green"}`}
          >
            {isSeen ? "SPOTTED" : "UNSEEN"}
          </button>
        </div>

        <div className="text-xs font-mono text-text-secondary space-y-2">
          <div className="flex justify-between">
            <span>LAT</span>
            <span className="text-sonar-green">{fish.latestSighting?.latitude.toFixed(6)}</span>
          </div>
          <div className="flex justify-between">
            <span>LON</span>
            <span className="text-sonar-green">{fish.latestSighting?.longitude.toFixed(6)}</span>
          </div>
          <div className="flex justify-between border-t border-panel-border pt-2">
            <span>LAST SEEN</span>
            <span className="text-warning-amber">
              {lastSeen ? formatDistanceToNow(new Date(lastSeen), { addSuffix: true }) : "Never"}
            </span>
          </div>
        </div>

        <div className="flex-grow flex items-center justify-center overflow-hidden rounded bg-panel-border mt-3">
          <img
            src={fish.image}
            alt={fish.name}
            className="max-h-full max-w-full object-contain"
          />
        </div>
      </div>
    </div>
  );
}