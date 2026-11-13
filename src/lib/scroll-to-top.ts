import type { AnyRouter } from "@tanstack/react-router";

/**
 * Brings the visitor to the very top of the page. Scrolls immediately and once
 * more after the navigation has rendered, so neither scroll restoration nor a
 * page still loading can leave the visitor halfway down.
 */
export function scrollToTop(router: AnyRouter) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  const unsubscribe = router.subscribe("onResolved", () => {
    unsubscribe();
    requestAnimationFrame(() => {
      if (window.scrollY > 0) window.scrollTo({ top: 0, behavior: "auto" });
    });
  });
  // Same-page clicks resolve no navigation; drop the listener shortly after.
  window.setTimeout(unsubscribe, 3000);
}
