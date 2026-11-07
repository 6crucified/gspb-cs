"use client";

import { UserButton } from "@clerk/nextjs";

export function AccountChip() {
  return (
    <div className="flex items-center rounded-sm bg-paper/80 p-0.5 shadow-sm ring-1 ring-line/80 backdrop-blur-sm">
      <UserButton afterSignOutUrl="/" />
    </div>
  );
}
