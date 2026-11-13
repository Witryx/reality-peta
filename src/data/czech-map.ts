import { createServerFn } from "@tanstack/react-start";
import { listProperties } from "./properties";

export type CzechMapPin = {
  label: string;
  x: number;
  y: number;
  active: boolean;
};

/** Map canvas in the same projection as public/brand/cz-dots.svg. */
export const czechMapSize = { width: 440, height: 253 } as const;

/** Places sold without a published listing yet. A listing in the same town replaces the entry. */
const extraSoldPlaces = ["Sušice"];

const lonScale = 440 / 7;
const latScale = 440 / (7 * Math.cos((49.8 * Math.PI) / 180));
const project = (lon: number, lat: number) => ({
  x: Math.round((lon - 12) * lonScale * 10) / 10,
  y: Math.round((51.1 - lat) * latScale * 10) / 10,
});

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();

/** Candidate names for a location, e.g. "Praha 7 – Holešovice" -> "Praha 7", "Praha". */
function candidates(...values: (string | undefined)[]) {
  const names: string[] = [];
  for (const value of values) {
    if (!value) continue;
    names.push(value.trim());
    for (const part of value.split(/[,·/()–-]| okres /)) {
      const name = part.trim();
      if (!name) continue;
      names.push(name, name.replace(/\s+\d+$/, ""));
    }
  }
  return names;
}

/** Homepage map: every Czech listing as a dot, active offers highlighted. Runs on the server. */
export const listCzechMapPins = createServerFn({ method: "GET" }).handler(
  async (): Promise<CzechMapPin[]> => {
    const [{ czechPlaces }, properties] = await Promise.all([
      import("@/server/czech-places.server"),
      listProperties(),
    ]);
    const places = new Map<string, { label: string; lon: number; lat: number; active: boolean }>();
    const add = (label: string, lon: number, lat: number, active: boolean) => {
      const id = normalize(label);
      const known = places.get(id);
      if (known) known.active ||= active;
      else places.set(id, { label, lon, lat, active });
    };
    for (const property of properties) {
      const active = property.status !== "sold";
      const { city, district, lat, lng } = property.location;
      if (lat !== undefined && lng !== undefined) {
        add(city, lng, lat, active);
        continue;
      }
      for (const name of candidates(city, district)) {
        const position = czechPlaces[normalize(name)];
        if (position) {
          add(name, position[0], position[1], active);
          break;
        }
      }
    }
    for (const name of extraSoldPlaces) {
      const position = czechPlaces[normalize(name)];
      if (position && !places.has(normalize(name))) add(name, position[0], position[1], false);
    }
    return [...places.values()]
      .filter(({ lon, lat }) => lon > 11.9 && lon < 19 && lat > 48.5 && lat < 51.1)
      .map(({ label, lon, lat, active }) => ({ label, active, ...project(lon, lat) }));
  },
);
