export function terminalWrite(text: string) {
  return text.replace(/\n/g, "\r\n");
}

export function createTerminalSession({
  classroomId,
  ownerId,
  sessionId,
  postSession,
  onOutput,
}: {
  classroomId: string;
  ownerId: string;
  sessionId: string;
  postSession: (body: Record<string, unknown>) => Promise<{ output?: string; error?: string }>;
  onOutput: (chunk: string) => void;
}) {
  let inputTail = Promise.resolve();
  let pollTimer = 0;
  let pollInFlight = false;
  let stopped = false;

  function writeFromServer(raw: string | undefined) {
    if (!raw) return;
    onOutput(terminalWrite(raw));
  }

  function enqueueInput(data: string) {
    if (!data || stopped) return;
    inputTail = inputTail
      .then(async () => {
        if (stopped) return;
        const result = await postSession({
          op: "input",
          classroomId,
          ownerId,
          session: sessionId,
          data,
        });
        writeFromServer(result.output);
        if (result.error) onOutput(`\r\n${result.error}\r\n`);
      })
      .catch(() => undefined);
  }

  async function pollOnce() {
    if (stopped || pollInFlight || document.visibilityState === "hidden") return;
    pollInFlight = true;
    try {
      const query = new URLSearchParams({ classroomId, ownerId, session: sessionId });
      const response = await fetch(`/api/workspace/session?${query}`);
      const payload = (await response.json()) as { output?: string };
      writeFromServer(payload.output);
    } catch {
      /* retry next tick */
    } finally {
      pollInFlight = false;
    }
  }

  function startPolling() {
    const tick = () => {
      void pollOnce();
      const delay = document.visibilityState === "hidden" ? 500 : 50;
      pollTimer = window.setTimeout(tick, delay);
    };
    tick();
  }

  function stop() {
    stopped = true;
    window.clearTimeout(pollTimer);
  }

  return { enqueueInput, startPolling, stop, writeFromServer };
}
