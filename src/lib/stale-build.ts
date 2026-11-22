/**
 * After a new deployment the browser may still hold the previous page, whose code chunks no
 * longer exist on the server. Opening a listing then fails for a moment with a confusing error.
 * These helpers recognise that case and reload the page once (guarded per session), so the
 * visitor simply gets the new version instead of an error.
 */
const staleChunk =
  /dynamically imported module|Importing a module script failed|error loading dynamically imported module|Unable to preload CSS|Loading (CSS )?chunk|ChunkLoadError|Outdated Optimize Dep/i;

export function isStaleBuildError(error: unknown): boolean {
  const message =
    error instanceof Error
      ? `${error.name}: ${error.message}`
      : typeof error === "string"
        ? error
        : "";
  return staleChunk.test(message);
}

const RELOAD_KEY = "ppr-stale-reload";

/** Reloads the page once per minute at most; returns false when it already tried. */
export function reloadOnce(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
    if (Date.now() - last < 60_000) return false;
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    // Without storage a reload could repeat forever; show the normal message instead.
    return false;
  }
  window.location.reload();
  return true;
}
