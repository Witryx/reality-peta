import { useEffect } from "react";
import { useLocation } from "@tanstack/react-router";

/**
 * Homepage "průvodce": a brand cursor that shows visitors what is clickable — the Google rating
 * and all partner logos in the hero after load.
 * Purely decorative (aria-hidden, pointer-events none), once per browser session per stop,
 * skipped with reduced motion. Shown on phones too, slightly smaller.
 */
type Stop = { id: string; selector: string; delay: number };

const STOPS: Stop[] = [
  // Hero: Google rating (opens references), then every partner logo.
  { id: "hero", selector: ".hero-facts-link, .hero-trust .partner-item > a", delay: 1300 },
];
const STORAGE_KEY = "guide-cursor-seen";

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

function seen(): string[] {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}
function markSeen(id: string) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...seen(), id]));
  } catch {
    /* storage unavailable: the guide simply may show again */
  }
}

export function GuideCursor() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (pathname !== "/") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const small = window.innerWidth < 640;
    let cancelled = false;
    let busy = Promise.resolve();
    let cursor: HTMLDivElement | null = null;
    // Page coordinates (not screen ones): the cursor stays on its target while the page scrolls.
    let position = {
      x: window.scrollX + window.innerWidth * 0.82,
      y: window.scrollY + window.innerHeight * 0.72,
    };

    const stop = () => {
      cancelled = true;
      cursor?.classList.remove("is-visible");
    };
    window.addEventListener("keydown", stop, { once: true });

    cursor = document.createElement("div");
    cursor.className = "guide-cursor";
    cursor.setAttribute("aria-hidden", "true");
    cursor.innerHTML = `<svg viewBox="0 0 24 24" width="${small ? 32 : 38}" height="${small ? 32 : 38}"><path d="M4 2.5 20 11l-7.1 1.9L9.4 20z" /></svg><span class="guide-cursor-ripple"></span>`;
    document.body.append(cursor);

    const place = (x: number, y: number) => {
      if (cursor) cursor.style.transform = `translate(${x}px, ${y}px)`;
    };

    async function visit(target: HTMLElement) {
      const box = target.getBoundingClientRect();
      if (box.bottom < 0 || box.top > window.innerHeight) return;
      const to = {
        x: window.scrollX + box.left + box.width * 0.62,
        y: window.scrollY + box.top + box.height * 0.58,
      };
      if (cursor) {
        const from = position;
        // Slight arc: the mid point lifts above the straight line, like a real hand movement.
        const mid = { x: (from.x + to.x) / 2, y: Math.min(from.y, to.y) - 40 };
        await cursor.animate(
          [
            { transform: `translate(${from.x}px, ${from.y}px)` },
            { transform: `translate(${mid.x}px, ${mid.y}px)`, offset: 0.55 },
            { transform: `translate(${to.x}px, ${to.y}px)` },
          ],
          { duration: small ? 650 : 900, easing: "cubic-bezier(.45,.05,.25,1)", fill: "forwards" },
        ).finished;
        place(to.x, to.y);
        position = to;
        cursor.classList.remove("is-clicking");
        void cursor.offsetWidth; // restart the click animation
        cursor.classList.add("is-clicking");
      }
      target.classList.add("is-guided");
      await wait(800);
      target.classList.remove("is-guided");
    }

    async function run(stop: Stop) {
      await wait(stop.delay);
      const targets = [...document.querySelectorAll<HTMLElement>(stop.selector)];
      if (cancelled || !targets.length) return;
      markSeen(stop.id);
      if (cursor) {
        // Enter from just beside the first target when coming back after scrolling.
        const first = targets[0];
        if (stop.id !== "hero" && first) {
          const box = first.getBoundingClientRect();
          position = {
            x: window.scrollX + Math.min(box.right + 160, window.innerWidth - 40),
            y: window.scrollY + box.top + 90,
          };
        }
        place(position.x, position.y);
        cursor.classList.add("is-visible");
      }
      for (const target of targets) {
        if (cancelled) break;
        await visit(target);
      }
      await wait(250);
      cursor?.classList.remove("is-visible");
      await wait(300);
    }

    const pending = STOPS.filter((s) => !seen().includes(s.id));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);
          const stopDef = pending.find((s) => entry.target.matches(s.selector));
          if (stopDef) busy = busy.then(() => (cancelled ? undefined : run(stopDef)));
        });
      },
      { threshold: 0.9, rootMargin: "0px 0px -12% 0px" },
    );
    // Wait a frame so the route content is in the DOM, then watch the first target of each stop.
    const frame = window.requestAnimationFrame(() => {
      pending.forEach((s) => {
        const first = document.querySelector(s.selector);
        if (first) observer.observe(first);
      });
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("keydown", stop);
      cursor?.remove();
    };
  }, [pathname]);
  return null;
}
