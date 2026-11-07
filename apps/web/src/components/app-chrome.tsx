"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { AccountChip } from "@/components/account-chip";
import { SiteNav } from "@/components/marketing/site-nav";
import { isIdePath, isMinimalChromePath } from "@/lib/minimal-chrome";

export function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { isLoaded, isSignedIn } = useAuth();
  const signedIn = Boolean(isSignedIn);
  const minimal = isLoaded && isMinimalChromePath(pathname, signedIn);
  const ide = isIdePath(pathname);

  return (
    <>
      {minimal && !ide ? (
        <div className="pointer-events-none fixed right-0 top-0 z-50 p-2 sm:p-3">
          <div className="pointer-events-auto">
            <AccountChip />
          </div>
        </div>
      ) : !minimal ? (
        <SiteNav />
      ) : null}
      {children}
    </>
  );
}
