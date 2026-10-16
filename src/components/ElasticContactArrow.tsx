import { useEffect, useRef, useState } from "react";

// Matching cubic segments let a wave travel along the line while its right end stays fixed.
// The arrowhead changes angle with the free end, instead of moving as a rigid SVG image.
const frames = [
  "M74 8 C61 5 58 12.5 52.25 19.5 C46.5 26.5 38 33 14 28 C9 27 5 24 3 22 M3 22 L13 21 M3 22 L9 31",
  "M74 8 C61 1 55 7 49 18 C43 29 40 40 16 33 C10 31.25 4 28 0 24 M0 24 L11 24 M0 24 L5 34",
  "M74 8 C61 11 59 19 55 23 C51 27 32 22 12 19 C7 18.25 2 19 -3 17 M-3 17 L6 13 M-3 17 L5 25",
  "M74 8 C61 4 58 9 51 17 C44 25 39 40 18 33 C12 31 9 26 7 24 M7 24 L17 25 M7 24 L11 34",
  "M74 8 C61 8 58 15 53 21 C48 27 36 28 13 25 C8 24.35 4 22 2 20 M2 20 L12 18.5 M2 20 L8.5 28.5",
] as const;

export function ElasticContactArrow() {
  const [motionAllowed, setMotionAllowed] = useState(false);
  const animation = useRef<SVGAnimateElement>(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setMotionAllowed(!media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    // Start relative to mounting, even when hydration happens after the page's SVG clock starts.
    if (motionAllowed) animation.current?.beginElementAt?.(1);
  }, [motionAllowed]);

  return (
    <svg viewBox="0 0 78 44" fill="none" aria-hidden="true">
      <path
        pathLength="1"
        d={frames[0]}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {motionAllowed && (
          <animate
            ref={animation}
            attributeName="d"
            values={[...frames, frames[0]].join(";")}
            keyTimes="0;0.2;0.42;0.62;0.8;1"
            calcMode="spline"
            keySplines="0.3 0 0.6 1;0.2 0.65 0.35 1;0.2 0.65 0.35 1;0.2 0.65 0.35 1;0.2 0.65 0.35 1"
            begin="indefinite"
            dur="1.65s"
            repeatCount="3"
            fill="remove"
          />
        )}
      </path>
    </svg>
  );
}
