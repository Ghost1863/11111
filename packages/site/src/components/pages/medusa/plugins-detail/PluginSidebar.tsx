"use client";

import { useRef } from "react";
import type { Plugin } from "@/types";
import PluginInfo from "./PluginInfo";
import PluginInfoSupportBanner from "./PluginInfoSupportBanner";

export default function PluginSidebar({ plugin }: { plugin: Plugin }) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className="max-lg:border-r-[0] border-r overflow-clip"
      ref={containerRef}
    >
      <div className="sticky top-14">
        <PluginInfoSupportBanner containerRef={containerRef} />
        <PluginInfo plugin={plugin} />
      </div>
    </div>
  );
}
