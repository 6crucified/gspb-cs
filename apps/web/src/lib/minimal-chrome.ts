/** Full top nav hidden; only floating account (+ page-local links). */
export function isMinimalChromePath(pathname: string, signedIn: boolean) {
  if (!signedIn) return false;
  if (pathname === "/" || pathname === "/classes") return true;
  return /^\/classes\/(?!new(?:\/|$))[^/]+\/espace/.test(pathname);
}

export function isIdePath(pathname: string) {
  return /^\/classes\/(?!new(?:\/|$))[^/]+\/espace/.test(pathname);
}
