"use client";

import { useState } from "react";
import { Fish } from "@/types/fish";
import Map from "./Map";
import FishList from "./FishList";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

interface FishTrackerClientProps {
  fishes: Fish[];
  sortedFishes: Fish[];
}

export default function FishTrackerClient({
  fishes,
  sortedFishes,
}: FishTrackerClientProps) {
  const [hoveredFishId, setHoveredFishId] = useState<string | null>(null);

  return (
    <PanelGroup
      direction="horizontal"
      className="flex-1"
      autoSaveId="fish-tracker-client"
    >
      {/* Map Panel */}
    <Panel defaultSize={65} minSize={30}>
      <div className="w-full h-full relative shadow-[--shadow-map-panel]">
        <Map fishes={fishes} hoveredFishId={hoveredFishId} />
      </div>
    </Panel>

    {/* Resize Handle (horizontal layout → vertical handle) */}
    <PanelResizeHandle className="w-1 bg-panel-border hover:bg-sonar-green transition-colors duration-200 cursor-col-resize relative group">
      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-1 bg-sonar-green opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-12 w-1 bg-panel-border rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-8 w-0.5 bg-sonar-green rounded-full" />
        </div>
      </div>
    </PanelResizeHandle>

      {/* Fish List Panel */}
      <Panel defaultSize={35} minSize={20}>
        <FishList fishes={sortedFishes} onFishHover={setHoveredFishId} />
      </Panel>
    </PanelGroup>
  );
}
