import { useEffect, useRef, useState } from "react";
import { SiteText } from "@/components/SiteText";
import { useSiteConfig } from "@/lib/website-context";

const arcPath = "M 18 96 C 140 -10, 300 -10, 420 96";
const planePath =
  "M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z";

function useClock(timeZone: string) {
  const [time, setTime] = useState("--:--");
  useEffect(() => {
    const format = new Intl.DateTimeFormat("cs-CZ", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone,
    });
    const tick = () => setTime(format.format(new Date()));
    tick();
    const timer = window.setInterval(tick, 10_000);
    return () => window.clearInterval(timer);
  }, [timeZone]);
  return time;
}

/** Flies the plane along the route, turns it smoothly at each end and flies back. */
function usePlane() {
  const arc = useRef<SVGPathElement>(null);
  const plane = useRef<SVGGElement>(null);
  useEffect(() => {
    const path = arc.current;
    const node = plane.current;
    if (!path || !node) return;
    const length = path.getTotalLength();
    const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
    const at = (s: number) => path.getPointAtLength(Math.max(0, Math.min(length, s)));
    const heading = (s: number) => {
      const a = at(s - 1);
      const b = at(s + 1);
      return (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
    };
    const place = (s: number, angle: number) => {
      const point = at(s);
      node.setAttribute("transform", `translate(${point.x} ${point.y}) rotate(${angle})`);
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      place(length / 2, heading(length / 2));
      return;
    }
    const fly = 4600;
    const turn = 1100;
    const cycle = 2 * (fly + turn);
    let start: number | null = null;
    let frame = 0;
    const step = (now: number) => {
      start ??= now;
      const t = (now - start) % cycle;
      if (t < fly) {
        const s = ease(t / fly) * length;
        place(s, heading(s));
      } else if (t < fly + turn) {
        place(length, heading(length) + 180 * ease((t - fly) / turn));
      } else if (t < 2 * fly + turn) {
        const s = (1 - ease((t - fly - turn) / fly)) * length;
        place(s, heading(s) + 180);
      } else {
        place(0, heading(0) + 180 + 180 * ease((t - 2 * fly - turn) / turn));
      }
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, []);
  return { arc, plane };
}

/** "U nás i u moře": live Prague and Hurghada clocks, a flight between them and three facts. */
export function AboutCard() {
  const site = useSiteConfig();
  const prague = useClock("Europe/Prague");
  const hurghada = useClock("Africa/Cairo");
  const { arc, plane } = usePlane();

  return (
    <div className="about-card" aria-label="Praha a Hurghada">
      <div className="about-card-map" aria-hidden />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="about-card-city">
            <SiteText>{"PRAHA"}</SiteText>
          </p>
          <p className="about-card-time" suppressHydrationWarning>
            {prague}
          </p>
          <p className="about-card-place">
            <SiteText>{"Česko"}</SiteText>
          </p>
        </div>
        <div className="text-right">
          <p className="about-card-city">
            <SiteText>{"HURGHADA"}</SiteText>
          </p>
          <p className="about-card-time" suppressHydrationWarning>
            {hurghada}
          </p>
          <p className="about-card-place">
            <SiteText>{"Egypt · Rudé moře"}</SiteText>
          </p>
        </div>
      </div>
      <div className="about-card-route" aria-hidden>
        <svg viewBox="0 0 440 120" preserveAspectRatio="xMidYMid meet">
          <path
            ref={arc}
            d={arcPath}
            fill="none"
            stroke="#d08a3c"
            strokeWidth="1.5"
            strokeDasharray="4 6"
          />
          <circle cx="18" cy="96" r="4" fill="#d08a3c" />
          <circle cx="420" cy="96" r="4" fill="#d08a3c" />
          <g ref={plane} transform="translate(18 96)">
            <g transform="scale(1.35) rotate(45) translate(-12,-12)">
              <path
                d={planePath}
                fill="#e8c690"
                stroke="#e8c690"
                strokeWidth="1"
                strokeLinejoin="round"
                className="about-card-plane"
              />
            </g>
          </g>
        </svg>
      </div>
      <p className="about-card-flight">
        <SiteText>{"PŘÍMÝ LET CCA 4,5 HODINY"}</SiteText>
      </p>
      <div className="about-card-facts">
        <div className="about-card-fact">
          <b>
            <SiteText>{site.googleReviews.rating}</SiteText>
          </b>
          <span className="about-card-stars" aria-hidden>
            ★★★★★
          </span>
          <span>
            <SiteText>{"hodnocení na Googlu"}</SiteText>
            {site.googleReviews.count && (
              <>
                {" · "}
                {site.googleReviews.count} <SiteText>{"recenzí"}</SiteText>
              </>
            )}
          </span>
        </div>
        <div className="about-card-fact">
          <b>
            <SiteText>{"2"}</SiteText>
          </b>
          <span>
            <SiteText>{"země, jeden makléř: Česko a Egypt"}</SiteText>
          </span>
        </div>
        <div className="about-card-fact">
          <b>{site.dealsCount}</b>
          <span>
            <SiteText>{"prodaných a pronajatých nemovitostí"}</SiteText>
          </span>
        </div>
      </div>
      <p className="about-card-status">
        <span className="about-card-dot" aria-hidden />
        <SiteText>{"Odpovídám osobně, obvykle ještě týž den."}</SiteText>
      </p>
    </div>
  );
}
