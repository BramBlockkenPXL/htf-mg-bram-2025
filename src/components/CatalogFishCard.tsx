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

  useEffect(() => {
    const set = readSeenSet();
    setIsSeen(set.has(fish.id));

    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        const s = readSeenSet();
        setIsSeen(s.has(fish.id));
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [fish.id]);

  const toggleSeen = () => {
    const set = readSeenSet();
    if (set.has(fish.id)) {
      set.delete(fish.id);
      setIsSeen(false);
      onToggleSeen?.(fish.id, false);
    } else {
      set.add(fish.id);
      setIsSeen(true);
      onToggleSeen?.(fish.id, true);
    }
    writeSeenSet(set);
    // notify other tabs/components
    window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));

    // transient visual feedback
    setJustToggled(true);
    window.setTimeout(() => setJustToggled(false), 900);
  };

  // visual state classes
  const cardFilterClass = isSeen ? "" : "filter grayscale contrast-75"; // unseen = grayscale
  const badgeClass = isSeen ? "bg-warning-amber text-dark-navy" : "bg-neutral-600/30 text-text-secondary";

  return (
    <div className={`relative rounded-lg overflow-hidden border border-panel-border shadow-[--shadow-cockpit-border] ${cardFilterClass} transition-all`}>
      {/* visual confirmation overlay when toggled */}
      {justToggled && (
        <div className="absolute inset-0 bg-sonar-green/10 flex items-center justify-center z-20 pointer-events-none animate-fade">
          <div className="px-3 py-1 rounded bg-dark-navy border border-panel-border text-sm font-mono">
            {isSeen ? "Marked as spotted" : "Marked as unseen"}
          </div>
        </div>
      )}

      <div className="p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="text-sm font-bold text-text-primary">{fish.name}</div>
            <div className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mt-1 ${getRarityBadgeClass(fish.rarity)}`}>
              {fish.rarity}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className={`px-2 py-0.5 rounded text-[11px] font-bold ${badgeClass}`}>{isSeen ? "SPOTTED" : "UNSEEN"}</div>
            <button
              onClick={toggleSeen}
              className={`text-xs font-mono px-3 py-1 rounded border transition ${isSeen ? "bg-warning-amber text-dark-navy border-warning-amber" : "bg-[color-mix(in_srgb,var(--color-dark-navy)_85%,transparent)] border-panel-border text-sonar-green"}`}
            >
              {isSeen ? "Mark unseen" : "Mark spotted"}
            </button>
          </div>
        </div>

        <div className="mt-3 text-xs font-mono text-text-secondary space-y-2">
          <div className="flex justify-between">
            <span>LAT</span>
            <span className="text-sonar-green">{fish.latestSighting.latitude.toFixed(6)}</span>
          </div>
          <div className="flex justify-between">
            <span>LON</span>
            <span className="text-sonar-green">{fish.latestSighting.longitude.toFixed(6)}</span>
          </div>
          <div className="flex justify-between border-t border-panel-border pt-2">
            <span>LAST SEEN</span>
            <span className="text-warning-amber">{formatDistanceToNow(new Date(fish.latestSighting.timestamp), { addSuffix: true })}</span>
          </div>
          <div className="mt-3">
            <img src={fish.image} alt={fish.name} className="w-full rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
