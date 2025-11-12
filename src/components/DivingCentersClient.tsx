"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface DivingCenter {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  phoneNumber?: string;
  email?: string;
  description?: string;
}

interface DivingCentersClientProps {
  centers: DivingCenter[];
}

export default function DivingCentersClient({ centers }: DivingCentersClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "distance">("name");

  const filtered = centers.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

  return (
    <div className="flex flex-col h-full gap-0">
      {/* Header */}
      <div className="px-6 py-4 border-b border-panel-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-sonar-green hover:text-warning-amber transition-colors font-mono">
            ← TRACKER
          </Link>
          <span className="text-text-secondary">|</span>
          <h2 className="text-xl font-bold text-sonar-green font-mono">DIVING CENTERS</h2>
        </div>
        <div className="text-xs text-text-secondary mt-1">Browse all available diving centers and their details</div>
      </div>

      {/* Search and sort controls */}
      <div className="px-6 py-4 border-b border-panel-border flex items-center gap-4 flex-shrink-0">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name or location..."
          className="flex-1 px-3 py-1 bg-[color-mix(in_srgb,var(--color-dark-navy)_90%,transparent)] border border-panel-border rounded text-sm font-mono"
        />
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy("name")}
            className={`px-3 py-1 text-xs rounded font-mono font-bold ${sortBy === "name" ? "bg-sonar-green text-dark-navy" : "bg-[color-mix(in_srgb,var(--color-dark-navy)_85%,transparent)] border border-panel-border text-sonar-green"}`}
          >
            NAME
          </button>
        </div>
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {sorted.length > 0 ? (
          <div className="space-y-3">
            {sorted.map((center) => (
              <div
                key={center.id}
                className="p-4 border border-panel-border rounded-lg bg-[color-mix(in_srgb,var(--color-dark-navy)_85%,transparent)] hover:border-sonar-green transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-bold text-sonar-green">{center.name}</h3>
                    {center.address && (
                      <div className="text-xs text-text-secondary mt-1">{center.address}</div>
                    )}
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/${center.latitude},${center.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-1 bg-sonar-green text-dark-navy text-xs rounded font-mono hover:bg-warning-amber transition-colors"
                  >
                    MAP
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono text-text-secondary mb-2">
                  <div>
                    <span className="text-text-secondary">LAT:</span>
                    <span className="text-sonar-green ml-1">{center.latitude.toFixed(6)}</span>
                  </div>
                  <div>
                    <span className="text-text-secondary">LON:</span>
                    <span className="text-sonar-green ml-1">{center.longitude.toFixed(6)}</span>
                  </div>
                </div>

                {center.phoneNumber && (
                  <div className="text-xs text-text-secondary mb-1">
                    <span className="text-sonar-green">PHONE:</span>
                    <a href={`tel:${center.phoneNumber}`} className="ml-2 hover:text-sonar-green">
                      {center.phoneNumber}
                    </a>
                  </div>
                )}

                {center.email && (
                  <div className="text-xs text-text-secondary mb-1">
                    <span className="text-sonar-green">EMAIL:</span>
                    <a href={`mailto:${center.email}`} className="ml-2 hover:text-sonar-green">
                      {center.email}
                    </a>
                  </div>
                )}

                {center.description && (
                  <div className="text-xs text-text-secondary mt-2 border-t border-panel-border pt-2">
                    {center.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-text-secondary">
              <div className="text-lg font-mono mb-2">NO CENTERS FOUND</div>
              <div className="text-sm">Try adjusting your search</div>
            </div>
          </div>
        )}
      </div>

      {/* Footer stats */}
      <div className="px-6 py-3 border-t border-panel-border text-xs text-text-secondary font-mono flex-shrink-0">
        Showing {sorted.length} of {centers.length} diving centers
      </div>
    </div>
  );
}
