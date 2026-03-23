"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Plugin } from "@/types";

function stringToHash(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}

function stringToColor(str: string) {
  const hash = stringToHash(str);
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 65%, 55%)`;
}

export default function PluginAvatar({
  plugin,
  size = 50,
  className,
}: {
  plugin: Plugin;
  size?: number;
  className?: string;
}) {
  const [imageError, setImageError] = useState(false);

  if (plugin.icon && !imageError) {
    return (
      <Image
        src={plugin.icon}
        alt={`${plugin.label} logo`}
        width={size}
        height={size}
        className={cn(`rounded-lg object-cover border shadow-xs`, className)}
        onError={() => setImageError(true)}
      />
    );
  }

  const bgColor = stringToColor(plugin.label ?? "swag");

  return (
    <div
      className={cn(
        `flex items-center justify-center text-white rounded-lg border shrink-0`,
        className,
      )}
      style={
        {
          backgroundColor: bgColor,
          width: `${size}px`,
          height: `${size}px`,
          fontSize: `${size / 2}px`,
        } as React.CSSProperties
      }
    >
      {plugin.label?.charAt(0).toUpperCase() ?? ""}
    </div>
  );
}
