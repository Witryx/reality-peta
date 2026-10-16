import { useEffect, useRef, useState } from "react";
import { contactArrowDuration, contactArrowFrames } from "@/lib/contact-arrow";

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
        d={contactArrowFrames[0]}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {motionAllowed && (
          <animate
            ref={animation}
            attributeName="d"
            values={contactArrowFrames.join(";")}
            calcMode="linear"
            begin="indefinite"
            dur={`${contactArrowDuration}s`}
            repeatCount="1"
            fill="remove"
          />
        )}
      </path>
    </svg>
  );
}
