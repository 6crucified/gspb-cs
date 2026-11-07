"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { isIdePath } from "@/lib/minimal-chrome";

export function SiteFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (isIdePath(pathname)) return <div className="h-dvh overflow-hidden">{children}</div>;
  return <main>{children}</main>;
}
