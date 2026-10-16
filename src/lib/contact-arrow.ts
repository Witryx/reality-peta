export const contactArrowDuration = 2.7;

type Point = readonly [number, number];

/** A single damped bend, keeping the original curve and the end beside the text fixed. */
export function contactArrowPath(time: number) {
  const bend =
    time <= 0 || time >= contactArrowDuration
      ? 0
      : 9 * (1 - Math.exp(-12 * time)) * Math.exp(-2.4 * time) * Math.sin(7.4 * time);
  const point = (x: number, y: number): Point => [x, y + bend * ((74 - x) / 71) ** 1.4];
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
export const contactArrowFrames = Array.from({ length: 82 }, (_, index) =>
  contactArrowPath((contactArrowDuration * index) / 81),
);
