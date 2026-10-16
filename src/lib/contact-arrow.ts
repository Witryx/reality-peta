const contactArrowCycles = 3;
export const contactArrowDuration = 5;

type Point = readonly [number, number];

function smoothstep(value: number) {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
}

/** Continuous back-and-forth flexing; only the beginning and end fade, never the cycle joins. */
export function contactArrowPath(time: number) {
  const envelope = smoothstep(time / 0.3) * smoothstep((contactArrowDuration - time) / 0.45);
  const bend =
    time <= 0 || time >= contactArrowDuration
      ? 0
      : 4.2 * envelope * Math.sin((2 * Math.PI * contactArrowCycles * time) / contactArrowDuration);
  const point = (x: number, y: number): Point => {
    const flex = bend * ((74 - x) / 71) ** 1.4;
    return [x + flex * 1.35, y - flex * 0.35];
  };
  const control = point(5, 24);
  const tip = point(3, 22);
  const angle = Math.atan2(tip[1] - control[1], tip[0] - control[0]) - Math.atan2(-2, -2);
  const wing = (x: number, y: number): Point => [
    tip[0] + x * Math.cos(angle) - y * Math.sin(angle),
    tip[1] + x * Math.sin(angle) + y * Math.cos(angle),
  ];
  const format = ([x, y]: Point) => `${Number(x.toFixed(3))} ${Number(y.toFixed(3))}`;

  return `M74 8 C${format(point(48, 2))} ${format(point(62, 38))} ${format(point(14, 28))} C${format(point(9, 27))} ${format(control)} ${format(tip)} M${format(tip)} L${format(wing(10, -1))} M${format(tip)} L${format(wing(6, 9))}`;
}

// Equally spaced samples interpolate smoothly in SVG, without per-frame JavaScript.
export const contactArrowFrames = Array.from({ length: 181 }, (_, index) =>
  contactArrowPath((contactArrowDuration * index) / 180),
);
