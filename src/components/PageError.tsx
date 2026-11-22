import { useRouter, type ErrorComponentProps } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { isStaleBuildError, reloadOnce } from "@/lib/stale-build";

/** Pages retried automatically: when, and the retry still running (if any). */
const retries = new Map<string, { at: number; done: Promise<void> | null }>();

/**
 * A short network or server hiccup (slow mobile data, a cold server) used to flash
 * "Stránku se nepodařilo načíst" for a moment. Now the page first shows a neutral loading
 * state, quietly tries once more (or reloads to the new version after a deploy) and only
 * a repeated failure shows the message.
 */
export function PageError({ error, reset }: ErrorComponentProps) {
  const router = useRouter();
  const [retrying, setRetrying] = useState(true);
  useEffect(() => {
    console.error(error);
    if (isStaleBuildError(error) && reloadOnce()) return;
    const path = window.location.pathname;
    let alive = true;
    // Still here a moment after the retry finished: the page really cannot load.
    const showAfter = (done: Promise<void>) =>
      void done.then(() => window.setTimeout(() => alive && setRetrying(false), 150));
    const earlier = retries.get(path);
    if (earlier && Date.now() - earlier.at < 20_000) {
      if (earlier.done) showAfter(earlier.done);
      else setRetrying(false);
      return () => {
        alive = false;
      };
    }
    const retry: { at: number; done: Promise<void> | null } = { at: Date.now(), done: null };
    retries.set(path, retry);
    const timer = window.setTimeout(() => {
      retry.done = router
        .invalidate()
        .catch(() => undefined)
        .then(() => reset());
      showAfter(retry.done);
    }, 900);
    return () => {
      alive = false;
      window.clearTimeout(timer);
      if (!retry.done) retries.delete(path);
    };
    // Runs once per error; reset/router identities may change between renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);
  if (retrying)
    return (
      <div className="page-retry" role="status">
        <span className="page-retry-spinner" aria-hidden />
        <span className="sr-only">Načítám…</span>
      </div>
    );
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-start justify-center py-24">
      <h1 className="text-4xl">Stránku se nepodařilo načíst</h1>
      <p className="mt-3 text-muted-foreground">Zkuste to prosím znovu.</p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="btn btn-primary"
        >
          Zkusit znovu
        </button>
        <a href="/" className="btn btn-outline">
          Na úvod
        </a>
      </div>
    </div>
  );
}
