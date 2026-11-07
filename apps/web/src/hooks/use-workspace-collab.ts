"use client";

import { useCallback, useEffect, useRef, useState, type MutableRefObject } from "react";
import type { RemotePeerState } from "@/lib/codemirror-remote-peer";
import { chunkPaths } from "@/lib/workspace-payload";
import type { WorkspaceFile } from "@/lib/workspace";
import type { WorkspaceCursor } from "@/lib/workspace-presence";

type SelectionPayload = {
  activePath: string;
  anchorLine: number;
  anchorCol: number;
  headLine: number;
  headCol: number;
};

async function fetchWorkspaceFiles(classroomId: string, ownerId: string, paths: string[]) {
  if (paths.length === 0) return [] as WorkspaceFile[];
  const batches = chunkPaths(paths);
  const merged: WorkspaceFile[] = [];
  for (const batch of batches) {
    const params = new URLSearchParams({
      classroomId,
      ownerId,
      paths: batch.join(","),
    });
    const response = await fetch(`/api/workspace/files?${params}`);
    if (!response.ok) continue;
    const payload = (await response.json()) as { files?: WorkspaceFile[] };
    if (payload.files?.length) merged.push(...payload.files);
  }
  return merged;
}

export function useWorkspaceCollab({
  classroomId,
  ownerId,
  filesRef,
  dirtyPathsRef,
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
  dirtyPathsRef: MutableRefObject<Set<string>>;
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
        const dirty = [...dirtyPathsRef.current];
        if (dirty.length === 0) return;
        const byPath = new Map(filesRef.current.map((file) => [file.path, file]));
        const payloadFiles = dirty.map((path) => byPath.get(path)).filter(Boolean) as WorkspaceFile[];
        if (payloadFiles.length === 0) return;

        const response = await fetch("/api/workspace/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ classroomId, ownerId, files: payloadFiles }),
        });
        if (!response.ok) return;
        const body = (await response.json()) as { rev?: number };
        if (typeof body.rev === "number") setFilesRev(body.rev);
        for (const path of dirty) dirtyPathsRef.current.delete(path);
      })();
    }, 650);
  }, [classroomId, dirtyPathsRef, filesRef, ownerId, setFilesRev]);

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
            const sync = (await syncRes.json()) as { unchanged?: boolean; rev?: number; paths?: string[] };
            if (!sync.unchanged && sync.paths) {
              const remoteFiles = await fetchWorkspaceFiles(classroomId, ownerId, sync.paths);
              const contentByPath = new Map(
                remoteFiles
                  .filter((file) => file.path !== ".folder" && !file.path.endsWith("/.folder"))
                  .map((file) => [file.path, file.text] as const),
              );
              setFiles(
                sync.paths.map((path) => ({
                  path,
                  text: contentByPath.get(path) ?? (path.endsWith("/.folder") || path === ".folder" ? "" : ""),
                })),
              );
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
