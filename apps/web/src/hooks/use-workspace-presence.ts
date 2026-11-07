"use client";

import { useEffect, useState } from "react";

export function useTeacherWatchingStudent({
  classroomId,
  ownerId,
  active,
}: {
  classroomId: string;
  ownerId: string;
  active: boolean;
}) {
  const [teacherPresent, setTeacherPresent] = useState(false);

  useEffect(() => {
    if (!active) return;
    let alive = true;
    let timer = 0;
    const poll = async () => {
      if (!alive) return;
      try {
        const query = new URLSearchParams({ classroomId, ownerId });
        const response = await fetch(`/api/workspace/presence?${query}`);
        if (!response.ok) return;
        const payload = (await response.json()) as { teacherActive?: boolean };
        if (alive) setTeacherPresent(Boolean(payload.teacherActive));
      } catch {
        /* ignore */
      } finally {
        if (alive) timer = window.setTimeout(poll, 2500);
      }
    };
    poll();
    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [active, classroomId, ownerId]);

  return teacherPresent;
}

export function useTeacherPresenceBeacon({
  classroomId,
  ownerId,
  enabled,
}: {
  classroomId: string;
  ownerId: string;
  enabled: boolean;
}) {
  useEffect(() => {
    if (!enabled) return;
    const body = JSON.stringify({ classroomId, ownerId });
    const ping = () =>
      void fetch("/api/workspace/presence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
    const leave = () =>
      void fetch(`/api/workspace/presence?classroomId=${encodeURIComponent(classroomId)}&ownerId=${encodeURIComponent(ownerId)}`, {
        method: "DELETE",
        keepalive: true,
      });

    ping();
    const interval = window.setInterval(ping, 5_000);
    const onHide = () => {
      if (document.visibilityState === "hidden") leave();
      else ping();
    };
    window.addEventListener("pagehide", leave);
    window.addEventListener("visibilitychange", onHide);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("pagehide", leave);
      window.removeEventListener("visibilitychange", onHide);
      leave();
    };
  }, [classroomId, enabled, ownerId]);
}
