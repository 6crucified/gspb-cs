#!/usr/bin/env python3
import json
import os
import pathlib
import pty
import select
import subprocess
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

ROOT = pathlib.Path("/workspace")
lock = threading.Lock()
shells = {}


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        path = self.path.split("?", 1)[0]
        if path == "/health":
            self._json(200, {"ok": True})
            return
        if path == "/session/output":
            self._json(200, {"output": drain(session_of(self.path))})
            return
        self._json(404, {"error": "introuvable"})

    def do_POST(self):
        path = self.path.split("?", 1)[0]
        length = int(self.headers.get("Content-Length", "0"))
        try:
            payload = json.loads(self.rfile.read(length) or b"{}")
        except json.JSONDecodeError:
            self._json(400, {"error": "json"})
            return

        session = session_of(self.path, payload.get("session"))
        if path == "/session/input":
            data = payload.get("data") or ""
            if not isinstance(data, str) or len(data) > 8000:
                self._json(400, {"error": "input"})
                return
            write_fd(session, data)
            self._json(200, {"ok": True, "output": drain(session)})
            return

        if path in ("/session/open", "/session/run"):
            write_files(payload.get("files") or [])
            remove_paths(payload.get("removed") or [])
            ensure_shell(session)
            command = payload.get("command") or ""
            if command:
                if not isinstance(command, str) or len(command) > 400:
                    self._json(400, {"error": "commande"})
                    return
                write_fd(session, command if command.endswith("\n") else command + "\n")
            self._json(200, {"ok": True, "output": drain(session)})
            return

        self._json(404, {"error": "introuvable"})

    def _json(self, status, body):
        raw = json.dumps(body).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    def log_message(self, fmt, *args):
        return


def safe_path(path):
    if not isinstance(path, str) or not path or len(path) > 180 or path.startswith("/") or "\\" in path:
        return False
    parts = path.split("/")
    return all(part not in ("", ".", "..") and len(part) <= 80 for part in parts)


def write_files(files):
    ROOT.mkdir(parents=True, exist_ok=True)
    for item in files:
        path = item.get("path") or ""
        if not safe_path(path) or path.endswith("/.folder") or path == ".folder":
            continue
        dest = ROOT / path
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(item.get("text") or "", encoding="utf-8")


def session_of(raw_path, explicit=None):
    if explicit in ("1", "2", "3"):
        return explicit
    query = parse_qs(urlparse(raw_path).query)
    value = (query.get("session") or ["1"])[0]
    return value if value in ("1", "2", "3") else "1"


def remove_paths(paths):
    for path in paths or []:
        if not safe_path(path):
            continue
        dest = ROOT / path
        if dest.is_file():
            dest.unlink()


def pump(entry, fd):
    while True:
        try:
            ready, _, _ = select.select([fd], [], [], 0.3)
            if entry.get("fd") != fd:
                return
            if not ready:
                continue
            chunk = os.read(fd, 8192)
            if not chunk:
                return
            with lock:
                entry["buf"] += chunk
                if len(entry["buf"]) > 200_000:
                    del entry["buf"][:-100_000]
        except OSError:
            return


def ensure_shell(session):
    entry = shells.get(session)
    if entry and entry["proc"] is not None and entry["proc"].poll() is None and entry["fd"] is not None:
        return entry
    ROOT.mkdir(parents=True, exist_ok=True)
    master, slave = pty.openpty()
    proc = subprocess.Popen(
        ["/bin/bash", "--noprofile", "--norc", "-i"],
        stdin=slave,
        stdout=slave,
        stderr=slave,
        cwd=str(ROOT),
        env={
            "PATH": os.environ.get("PATH", "/usr/local/bin:/usr/bin:/bin"),
            "HOME": "/workspace",
            "TERM": "xterm-256color",
            "PS1": "élève:~$ ",
            "LANG": "C.UTF-8",
        },
        start_new_session=True,
    )
    os.close(slave)
    entry = {"proc": proc, "fd": master, "buf": bytearray()}
    shells[session] = entry
    threading.Thread(target=pump, args=(entry, master), daemon=True).start()
    return entry


def write_fd(session, data):
    entry = ensure_shell(session)
    os.write(entry["fd"], data.encode())


def drain(session):
    entry = shells.get(session)
    if not entry:
        return ""
    with lock:
        data = bytes(entry["buf"])
        entry["buf"].clear()
    return data.decode("utf-8", "replace")


if __name__ == "__main__":
    ThreadingHTTPServer(("0.0.0.0", 8080), Handler).serve_forever()
