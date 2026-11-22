/**
 * Symbolic pictures for the website's sections (O mně, Egypt, Reference, Články).
 * Hand-drawn SVG in the brand colours: no photos to load, sharp on every screen, purely
 * decorative (aria-hidden) and still when the visitor prefers reduced motion.
 */

/** A wavy line repeated every 200 units, long enough to slide by one period without a seam. */
const wave = (y: number, height: number) =>
  `M-200 ${y} q50 ${-height} 100 0 ${"t100 0 ".repeat(19)}`;

/** Camel silhouette facing right, feet on y = 0 (same drawing as the desert sides). */
const camel =
  "M6 0 L8 -17 C4 -20 4 -26 8 -28 C12 -40 22 -42 28 -32 C32 -28 36 -28 40 -30 C44 -32 46 -40 48 -46 C49 -49 53 -50 56 -48 L58 -46 C59 -45 58 -44 57 -44 L52 -44 C50 -38 48 -30 44 -24 L44 -17 L46 0 L43 0 L41 -15 L38 -15 L39 0 L36 0 L34 -16 L18 -16 L17 0 L14 0 L13 -15 L11 -15 L10 0 Z";

function Palm({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path
        d="M0 0 C-2 -26 2 -50 12 -74"
        stroke="#8a6a44"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />
      <g fill="#4f7a52">
        <path d="M12 -74 C-6 -86 -26 -84 -38 -72 C-20 -76 -4 -76 12 -70 Z" />
        <path d="M12 -74 C4 -94 -14 -102 -30 -98 C-12 -92 2 -84 10 -70 Z" />
        <path d="M12 -74 C16 -94 32 -104 50 -102 C34 -94 22 -84 14 -70 Z" />
        <path d="M12 -74 C32 -82 50 -76 60 -62 C44 -68 28 -70 14 -70 Z" />
        <path d="M12 -74 C22 -66 28 -54 28 -40 C22 -52 16 -60 10 -68 Z" />
      </g>
    </g>
  );
}

/** Egypt: sun, pyramids, sand, a walking camel, the Hurghada skyline and the Red Sea. */
export function EgyptScene({ className = "" }: { className?: string }) {
  const buildings: [number, number, number, number][] = [
    [430, 190, 36, 48],
    [470, 166, 30, 72],
    [504, 198, 44, 40],
    [552, 148, 28, 90],
    [584, 182, 50, 56],
    [702, 174, 40, 64],
    [746, 196, 54, 42],
  ];
  return (
    <figure className={`egypt-scene ${className}`} aria-hidden="true">
      <svg viewBox="0 0 800 400" preserveAspectRatio="xMidYMid slice" focusable="false">
        <defs>
          <linearGradient id="es-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#d6edf1" />
            <stop offset="0.5" stopColor="#f5f0e2" />
            <stop offset="0.62" stopColor="#fbe5c0" />
          </linearGradient>
          <radialGradient id="es-sun" cx="0.42" cy="0.38" r="0.7">
            <stop offset="0" stopColor="#ffeab0" />
            <stop offset="0.5" stopColor="#ffc768" />
            <stop offset="1" stopColor="#f39f45" />
          </radialGradient>
          <radialGradient id="es-glow">
            <stop offset="0" stopColor="#ffd27a" stopOpacity="0.6" />
            <stop offset="1" stopColor="#ffd27a" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="es-dune" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ebcb93" />
            <stop offset="1" stopColor="#d6aa68" />
          </linearGradient>
          <linearGradient id="es-sea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7cc6cf" />
            <stop offset="0.45" stopColor="#2a95a3" />
            <stop offset="1" stopColor="#14707c" />
          </linearGradient>
          <pattern id="es-windows" width="9" height="11" patternUnits="userSpaceOnUse">
            <rect x="2" y="3" width="4" height="5" rx="0.6" fill="#e2c28a" opacity="0.8" />
          </pattern>
        </defs>

        <rect width="800" height="400" fill="url(#es-sky)" />

        {/* sun with slowly turning rays */}
        <circle cx="622" cy="104" r="110" fill="url(#es-glow)" />
        <g className="egypt-scene-rays">
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i * Math.PI) / 6;
            return (
              <line
                key={i}
                x1={622 + Math.cos(a) * 56}
                y1={104 + Math.sin(a) * 56}
                x2={622 + Math.cos(a) * 74}
                y2={104 + Math.sin(a) * 74}
                stroke="#f4b458"
                strokeWidth="4"
                strokeLinecap="round"
                opacity="0.55"
              />
            );
          })}
        </g>
        <circle cx="622" cy="104" r="44" fill="url(#es-sun)" />

        {/* seagulls */}
        <g
          className="egypt-scene-birds"
          fill="none"
          stroke="#7d7062"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M488 92 q6 -6 12 0 q6 -6 12 0" />
          <path d="M522 76 q5 -5 10 0 q5 -5 10 0" />
        </g>

        {/* pyramids on the horizon */}
        <path d="M20 238 L88 160 L156 238 Z" fill="#f0dcb3" />
        <path d="M88 160 L156 238 L114 238 Z" fill="#dcbd88" />
        <path d="M92 238 L200 112 L308 238 Z" fill="#ecd4a5" />
        <path d="M200 112 L308 238 L238 238 Z" fill="#d5ae74" />
        <path
          d="M131 193 H255 M154 166 H230 M110 216 H281"
          stroke="#d2b07c"
          strokeWidth="1.5"
          opacity="0.55"
        />
        <path d="M300 238 L345 186 L390 238 Z" fill="#f2e1bd" />
        <path d="M345 186 L390 238 L360 238 Z" fill="#e0c392" />

        {/* Hurghada skyline: hotels, a mosque with its minaret */}
        <g stroke="#d6bb90" strokeWidth="1.2">
          {buildings.map(([x, y, w, h]) => (
            <g key={x}>
              <rect x={x} y={y} width={w} height={h} fill="#fbf6ee" />
              <rect x={x} y={y} width={w} height={h} fill="url(#es-windows)" stroke="none" />
            </g>
          ))}
          <rect x="640" y="150" width="8" height="88" fill="#f6ecd8" />
          <path d="M637 152 L644 136 L651 152 Z" fill="#e9d3a8" />
          <path d="M636 176 H652" />
          <path d="M652 238 V214 Q674 184 696 214 V238 Z" fill="#efdfbf" />
        </g>
        <Palm x={476} y={250} scale={0.8} />
        <Palm x={690} y={252} scale={0.95} />

        {/* back dunes, front dune with the camel, beach and sea */}
        <path
          d="M0 238 C90 228 180 246 290 240 S470 228 560 240 S720 232 800 238 V400 H0 Z"
          fill="#f1dcb0"
        />
        <path
          d="M0 262 C60 251 140 249 220 252 S330 256 400 263 S500 286 570 302 V400 H0 Z"
          fill="url(#es-dune)"
        />
        <path
          d="M0 262 C60 251 140 249 220 252 S330 256 400 263"
          fill="none"
          stroke="#f6e3bd"
          strokeWidth="2"
          opacity="0.75"
        />
        <g className="egypt-scene-camel" fill="#94683a">
          <g transform="translate(70 255)">
            <path className="egypt-scene-camel-body" d={camel} />
          </g>
        </g>
        <path d="M0 290 C160 280 330 294 470 288 S700 278 800 284 V400 H0 Z" fill="#f6e6c4" />
        <path d="M0 308 C140 300 300 314 460 306 S690 298 800 304 V400 H0 Z" fill="url(#es-sea)" />
        <path
          d="M0 308 C140 300 300 314 460 306 S690 298 800 304"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2.5"
          opacity="0.75"
        />
        <g className="egypt-scene-waves" fill="none" stroke="#ffffff" strokeLinecap="round">
          <path d={wave(334, 6)} strokeWidth="2" opacity="0.45" />
          <path d={wave(362, 7)} strokeWidth="2" opacity="0.3" />
        </g>
        <g transform="translate(600 326)">
          <g className="egypt-scene-boat">
            <path d="M-20 0 L20 0 L13 9 L-13 9 Z" fill="#8a5a32" />
            <path d="M0 -1 V-38" stroke="#6d4b2d" strokeWidth="1.5" />
            <path d="M1.5 -36 L22 -4 H1.5 Z" fill="#ffffff" stroke="#e4d4bb" />
            <path d="M-1.5 -30 L-15 -4 H-1.5 Z" fill="#fbeee0" stroke="#e4d4bb" />
          </g>
        </g>
      </svg>
    </figure>
  );
}

const starPath =
  "M0 -11 L3.2 -3.6 L11 -3.4 L4.9 1.6 L6.9 9.3 L0 4.8 L-6.9 9.3 L-4.9 1.6 L-11 -3.4 L-3.2 -3.6 Z";

/** Reference: two speech bubbles, a big quote mark and five stars lighting up one by one. */
export function ReferenceVisual({ className = "" }: { className?: string }) {
  return (
    <div className={`section-visual reference-visual ${className}`} aria-hidden="true">
      <svg viewBox="0 0 400 270" focusable="false">
        <ellipse cx="200" cy="252" rx="150" ry="9" fill="#292927" opacity="0.06" />
        {/* the client's earlier message */}
        <path d="M292 132 L318 156 L322 132 Z" fill="#fbf6f0" stroke="#ead9c3" />
        <rect x="168" y="22" width="206" height="112" rx="20" fill="#fbf6f0" stroke="#ead9c3" />
        <circle cx="198" cy="54" r="12" fill="#ead9c3" />
        <rect x="218" y="47" width="96" height="7" rx="3.5" fill="#e3cfb4" />
        <rect x="190" y="80" width="160" height="7" rx="3.5" fill="#eadcc8" />
        <rect x="190" y="97" width="132" height="7" rx="3.5" fill="#eadcc8" />
        {/* the review in front */}
        <path d="M74 214 L58 244 L106 214 Z" fill="#ffffff" stroke="#bd5c17" strokeWidth="1.6" />
        <rect
          x="26"
          y="92"
          width="244"
          height="124"
          rx="22"
          fill="#ffffff"
          stroke="#bd5c17"
          strokeWidth="1.6"
        />
        <rect x="70" y="210" width="40" height="8" fill="#ffffff" />
        <text
          x="44"
          y="170"
          fontSize="78"
          style={{ fontFamily: "var(--font-display)" }}
          fill="#bd5c17"
        >
          “
        </text>
        <g className="reference-visual-stars" fill="#f7a600">
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i} transform={`translate(${104 + i * 30} 130)`}>
              <path d={starPath} style={{ animationDelay: `${0.4 + i * 0.22}s` }} />
            </g>
          ))}
        </g>
        <rect x="98" y="160" width="150" height="7" rx="3.5" fill="#eee3d4" />
        <rect x="98" y="177" width="112" height="7" rx="3.5" fill="#eee3d4" />
        <g className="reference-visual-sparkles" fill="#bd5c17">
          <path d="M30 60 l3 9 9 3 -9 3 -3 9 -3 -9 -9 -3 9 -3 z" />
          <path d="M372 172 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2 z" />
        </g>
      </svg>
    </div>
  );
}

/** Články: an open book with a house on one page, lines being written, a bookmark and a pen. */
export function ArticlesVisual({ className = "" }: { className?: string }) {
  const lines = [118, 100, 112, 84, 106, 70];
  return (
    <div className={`section-visual articles-visual ${className}`} aria-hidden="true">
      <svg viewBox="0 0 400 270" focusable="false">
        <ellipse cx="200" cy="246" rx="164" ry="10" fill="#292927" opacity="0.07" />
        {/* page edges underneath */}
        <path d="M200 232 C150 218 94 216 42 224 V218 C94 210 150 212 200 226 Z" fill="#eadcc8" />
        <path
          d="M200 232 C250 218 306 216 358 224 V218 C306 210 250 212 200 226 Z"
          fill="#eadcc8"
        />
        {/* pages */}
        <path
          d="M200 62 C156 46 98 42 46 52 V214 C98 204 156 208 200 224 Z"
          fill="#ffffff"
          stroke="#e4d3bb"
          strokeWidth="1.5"
        />
        <path
          d="M200 62 C244 46 302 42 354 52 V214 C302 204 244 208 200 224 Z"
          fill="#fffdf9"
          stroke="#e4d3bb"
          strokeWidth="1.5"
        />
        <path d="M200 62 V224" stroke="#d9c3a3" strokeWidth="1.5" />
        {/* left page: a house and its caption */}
        <path
          d="M80 132 L122 98 L164 132 V176 H80 Z"
          fill="#fbeee0"
          stroke="#bd5c17"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path
          d="M72 138 L122 96 L172 138"
          fill="none"
          stroke="#bd5c17"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="112" y="146" width="20" height="30" rx="2" fill="#bd5c17" opacity="0.85" />
        <rect x="84" y="190" width="78" height="6" rx="3" fill="#eadcc8" />
        {/* right page: lines being written */}
        <g className="articles-visual-lines" stroke="#cdb89b" strokeWidth="5" strokeLinecap="round">
          {lines.map((width, i) => (
            <path
              key={i}
              pathLength={1}
              d={`M222 ${84 + i * 20} h${width - 30}`}
              style={{ animationDelay: `${0.3 + i * 0.45}s` }}
            />
          ))}
        </g>
        {/* bookmark */}
        <path d="M318 40 V92 L328 82 L338 92 V40 Z" fill="#bd5c17" />
        {/* pen */}
        <g className="articles-visual-pen">
          <g transform="translate(300 206) rotate(-38)">
            <rect x="0" y="-6" width="78" height="12" rx="3" fill="#292927" />
            <rect x="58" y="-6" width="8" height="12" fill="#bd5c17" />
            <path d="M0 -6 L-14 0 L0 6 Z" fill="#f0d9b5" />
            <path d="M-14 0 L-9 -2 L-9 2 Z" fill="#292927" />
          </g>
        </g>
        {/* "pozor" badge */}
        <g className="articles-visual-badge" transform="translate(368 44)">
          <circle r="20" fill="#292927" />
          <rect x="-2.5" y="-11" width="5" height="14" rx="2.5" fill="#ffffff" />
          <circle cy="9" r="3" fill="#ffffff" />
        </g>
      </svg>
    </div>
  );
}
