"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function SiteFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const studio = /^\/classes\/(?!new(?:\/|$))[^/]+\/espace/.test(pathname);
  if (studio) return <div className="h-[calc(100dvh-4rem)] overflow-hidden">{children}</div>;
  return <main>{children}</main>;
}
