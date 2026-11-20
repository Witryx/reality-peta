import { Link } from "@tanstack/react-router";
import { photoAt } from "@/lib/photo-src";
import { formatPrice, type Property } from "@/data/types";

/** Wavy vertical line both chains follow (box 300 × 760 px). */
const PATH = "M150,-90 C80,10 220,110 150,190 S80,370 150,450 S220,630 150,710 S80,860 150,900";
const TILES = 6;

/**
 * Two slow „chains“ of listing photos in the empty margins beside the homepage hero:
 * Czech listings on the left (moving down), Egypt on the right (moving up). Only on wide
 * screens; pauses on hover; static with reduced motion. Decorative extra – the same listings
 * are in the board below, so the chain is hidden from assistive tech.
 */
export function HeroChains({ czech, egypt }: { czech: Property[]; egypt: Property[] }) {
  return (
    <div className="hero-chains" aria-hidden>
      <Chain side="left" items={czech} />
      <Chain side="right" items={egypt} />
    </div>
  );
}

function Chain({ side, items }: { side: "left" | "right"; items: Property[] }) {
  const usable = items.filter((p) => p.images.length > 0);
  if (!usable.length) return null;
  const tiles = Array.from({ length: TILES }, (_, i) => usable[i % usable.length]!);
  return (
    <div className={`hero-chain hero-chain-${side}`}>
      <div className="hero-chain-track">
        <svg className="hero-chain-line" viewBox="0 0 300 760" focusable="false">
          <path d={PATH} />
        </svg>
        {tiles.map((p, i) => {
          const cover = [...p.images].sort((a, b) => a.position - b.position)[0]!;
          return (
            <Link
              key={`${p.slug}-${i}`}
              to="/nabidka/$slug"
              params={{ slug: p.slug }}
              tabIndex={-1}
              className={`hero-chain-tile hero-chain-${p.status}`}
              style={{ "--i": i } as React.CSSProperties}
            >
              <img src={photoAt(cover.src, 480)} alt="" width={132} height={99} loading="lazy" />
              <span className="hero-chain-label">
                <span className="hero-chain-place">{p.location.city}</span>
                <span className="hero-chain-price">
                  {p.status === "upcoming"
                    ? "Připravuji"
                    : p.status === "reserved"
                      ? "Rezervováno"
                      : formatPrice(p)}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
