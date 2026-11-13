import { czechMapSize, type CzechMapPin } from "@/data/czech-map";
import { SiteText } from "./SiteText";

/** Pins closer than this (in map units) share one label, e.g. "Kytlice · Chřibská". */
const mergeDistance = 14;

type Label = { text: string; x: number; y: number; active: boolean };

function labels(pins: CzechMapPin[]): Label[] {
  const groups: { pins: CzechMapPin[] }[] = [];
  for (const pin of [...pins].sort((a, b) => Number(b.active) - Number(a.active))) {
    const near = groups.find((group) =>
      group.pins.some((other) => Math.hypot(other.x - pin.x, other.y - pin.y) < mergeDistance),
    );
    if (near) near.pins.push(pin);
    else groups.push({ pins: [pin] });
  }
  return groups.map(({ pins: group }) => {
    const first = group[0]!;
    const top = group.reduce((a, b) => (b.y < a.y ? b : a));
    return {
      text: group.map((pin) => pin.label).join(" · "),
      x: top.x,
      y: top.y,
      active: first.active,
    };
  });
}

/** Dot map of Czechia with every listing: active offers glow, sold ones stay as quiet dots. */
export function CzechMap({ pins, className = "" }: { pins: CzechMapPin[]; className?: string }) {
  if (!pins.length) return null;
  const { width, height } = czechMapSize;
  return (
    <figure className={`czech-map ${className}`} aria-label="Mapa Česka s místy, kde jsem prodával a pronajímal">
      <svg viewBox={`-10 -14 ${width + 20} ${height + 24}`} role="img" aria-hidden="true">
        <image href="/brand/cz-dots.svg" x="0" y="0" width={width} height={height} />
        {labels(pins).map((label) => {
          const right = label.x < width * 0.7;
          return (
            <text
              key={label.text}
              className={label.active ? "czech-map-label is-active" : "czech-map-label"}
              x={label.x + (right ? 10 : -10)}
              y={label.y + 4}
              textAnchor={right ? "start" : "end"}
            >
              {label.text}
            </text>
          );
        })}
        {pins.map((pin) =>
          pin.active ? (
            <g key={pin.label} className="czech-map-pin is-active">
              <circle className="czech-map-ring" cx={pin.x} cy={pin.y} r="7" />
              <circle cx={pin.x} cy={pin.y} r="6.5" />
            </g>
          ) : (
            <circle key={pin.label} className="czech-map-pin" cx={pin.x} cy={pin.y} r="5" />
          ),
        )}
      </svg>
      <figcaption className="czech-map-legend">
        <span>
          <i className="is-active" aria-hidden />
          <SiteText>{"aktivní nabídka"}</SiteText>
        </span>
        <span>
          <i aria-hidden />
          <SiteText>{"úspěšně prodáno"}</SiteText>
        </span>
      </figcaption>
    </figure>
  );
}
