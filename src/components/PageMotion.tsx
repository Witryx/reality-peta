import { useEffect } from "react";
import { useLocation } from "@tanstack/react-router";

/** Progressive enhancement: content stays visible without JavaScript or motion. */
export function PageMotion() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const nodes = document.querySelectorAll<HTMLElement>(
      "main section:not(.home-hero), main [data-reveal]:not(section)",
    );
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("motion-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 },
    );
    nodes.forEach((node, index) => {
      node.dataset["motion"] =
        node.dataset["reveal"] ||
        (node.classList.contains("egypt-band") ? "mask" : ["rise", "slide", "line"][index % 3]);
      node.classList.add("motion-ready");
      observer.observe(node);
    });
    return () => {
      observer.disconnect();
      nodes.forEach((node) => node.classList.remove("motion-ready"));
    };
  }, [pathname]);
  return null;
}
