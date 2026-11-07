"use client";

import { useCallback, useEffect, useRef, useState, type MutableRefObject } from "react";
import type { RemotePeerState } from "@/lib/codemirror-remote-peer";
import type { WorkspaceFile } from "@/lib/workspace";
import type { WorkspaceCursor } from "@/lib/workspace-presence";

type SelectionPayload = {
  activePath: string;
  anchorLine: number;
  anchorCol: number;
  headLine: number;
  headCol: number;
};

export function useWorkspaceCollab({
  classroomId,
  ownerId,
  filesRef,
  filesRev,
  setFilesRev,
  setFiles,
  activePath,
  collabActive,
  managingStudent,
}: {
  classroomId: string;
  ownerId: string;
  filesRef: MutableRefObject<WorkspaceFile[]>;
  filesRev: number;
  setFilesRev: (rev: number) => void;
  setFiles: React.Dispatch<React.SetStateAction<WorkspaceFile[]>>;
  activePath: string;
  collabActive: boolean;
  managingStudent: boolean;
}) {
  const [teacherPresent, setTeacherPresent] = useState(false);
  const [remotePeer, setRemotePeer] = useState<RemotePeerState>(null);
  const filesRevRef = useRef(filesRev);
  filesRevRef.current = filesRev;
  const saveTimerRef = useRef(0);
  const syncingRef = useRef(false);

  const pushPresence = useCallback(
    (cursor?: WorkspaceCursor) => {
      if (!managingStudent) return;
      void fetch("/api/workspace/presence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classroomId, ownerId, cursor }),
      });
    },
    [classroomId, managingStudent, ownerId],
  );

  const scheduleSave = useCallback(() => {
    window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      void (async () => {
        const response = await fetch("/api/workspace/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ classroomId, ownerId, files: filesRef.current }),
        });
        if (!response.ok) return;
        const payload = (await response.json()) as { rev?: number };
        if (typeof payload.rev === "number") setFilesRev(payload.rev);
      })();
    }, 650);
  }, [classroomId, filesRef, ownerId, setFilesRev]);

  const selectionTimerRef = useRef(0);
  const reportSelection = useCallback(
    (selection: SelectionPayload) => {
      if (!managingStudent) return;
      window.clearTimeout(selectionTimerRef.current);
      selectionTimerRef.current = window.setTimeout(() => {
        pushPresence({
          activePath: selection.activePath,
          anchorLine: selection.anchorLine,
          anchorCol: selection.anchorCol,
          headLine: selection.headLine,
          headCol: selection.headCol,
          filesRev: filesRevRef.current,
        });
      }, 120);
    },
    [managingStudent, pushPresence],
  );

  useEffect(() => {
    if (!managingStudent) return;
    const ping = () => pushPresence({ activePath, anchorLine: 0, anchorCol: 0, headLine: 0, headCol: 0, filesRev: filesRevRef.current });
    ping();
    const interval = window.setInterval(ping, 5_000);
    const leave = () =>
      void fetch(`/api/workspace/presence?classroomId=${encodeURIComponent(classroomId)}&ownerId=${encodeURIComponent(ownerId)}`, {
        method: "DELETE",
        keepalive: true,
      });
    window.addEventListener("pagehide", leave);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("pagehide", leave);
      leave();
    };
  }, [activePath, classroomId, managingStudent, ownerId, pushPresence]);

  useEffect(() => {
    if (!collabActive) return;
    let alive = true;
    let timer = 0;

    const poll = async () => {
      if (!alive || syncingRef.current) return;
      try {
        const presenceQuery = new URLSearchParams({ classroomId, ownerId });
        const presenceRes = await fetch(`/api/workspace/presence?${presenceQuery}`);
        if (!presenceRes.ok) return;
        const presence = (await presenceRes.json()) as {
          teacherActive?: boolean;
          rev?: number;
          cursor?: { activePath: string; headLine: number; headCol: number } | null;
        };

        if (alive) setTeacherPresent(Boolean(presence.teacherActive));

        const serverRev = presence.rev ?? 0;
        if (serverRev > filesRevRef.current) {
          syncingRef.current = true;
          const syncQuery = new URLSearchParams({
            classroomId,
            ownerId,
            rev: String(filesRevRef.current),
          });
          const syncRes = await fetch(`/api/workspace/sync?${syncQuery}`);
          if (syncRes.ok) {
            const sync = (await syncRes.json()) as { unchanged?: boolean; rev?: number; files?: WorkspaceFile[] };
            if (!sync.unchanged && sync.files) {
              setFiles(sync.files);
              if (typeof sync.rev === "number") setFilesRev(sync.rev);
            }
          }
          syncingRef.current = false;
        }

        if (
          alive &&
          presence.teacherActive &&
          presence.cursor &&
          presence.cursor.activePath === activePath &&
          !managingStudent
        ) {
          setRemotePeer({
            headLine: presence.cursor.headLine,
            headCol: presence.cursor.headCol,
            label: "Professeur",
          });
        } else if (alive && !managingStudent) {
          setRemotePeer(null);
        }
      } finally {
        if (alive) timer = window.setTimeout(poll, 1_200);
      }
    };

    poll();
    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [activePath, classroomId, collabActive, managingStudent, ownerId, setFiles, setFilesRev]);

  return { teacherPresent, remotePeer, scheduleSave, reportSelection };
}
