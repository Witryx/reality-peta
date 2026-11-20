/**
 * Decorative desert scenery in the side margins of Egypt sections: pyramids, dunes and a slow
 * camel caravan on the left, dunes and palms on the right. Purely decorative (aria-hidden),
 * sits behind the content; on narrow screens it shrinks into faint bottom corners.
 */
/** Wind-blown sand grains: [top %, size px, delay s, duration s]. */
const GRAINS: [number, number, number, number][] = [
  [58, 3, 0, 7],
  [64, 2, 1.4, 6],
  [70, 3, 2.6, 8],
  [62, 2, 3.8, 6.5],
  [75, 4, 0.8, 9],
  [68, 2, 4.6, 7.5],
  [80, 3, 2, 8.5],
  [72, 2, 5.4, 6],
  [60, 2, 6.2, 7],
  [78, 3, 3.2, 9.5],
];

export function DesertSides({ className = "" }: { className?: string }) {
  return (
    <div className={`desert-sides ${className}`} aria-hidden>
      {(["left", "right"] as const).map((side) => (
        <div key={side} className={`desert-wind desert-wind-${side}`}>
          {GRAINS.map(([top, size, delay, dur], i) => (
            <span
              key={i}
              style={
                {
                  top: `${top}%`,
                  width: size,
                  height: size,
                  animationDelay: `${delay + (side === "right" ? 1.7 : 0)}s`,
                  animationDuration: `${dur}s`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      ))}
      <svg
        className="desert-side desert-left"
        viewBox="0 0 420 520"
        preserveAspectRatio="xMinYMax meet"
        focusable="false"
      >
        <defs>
          <linearGradient id="dl-dune-back" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f3dfb6" />
            <stop offset="1" stopColor="#ecd3a2" />
          </linearGradient>
          <linearGradient id="dl-dune-front" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#e6c389" />
            <stop offset="1" stopColor="#d9ae6c" />
          </linearGradient>
        </defs>
        {/* far pyramids */}
        <g className="desert-pyramids">
          <path d="M150 300 L232 190 L314 300 Z" fill="#ead2a4" />
          <path d="M232 190 L314 300 L262 300 Z" fill="#d8b47a" />
          <path d="M62 300 L118 226 L174 300 Z" fill="#efdab2" />
          <path d="M118 226 L174 300 L138 300 Z" fill="#dcbc86" />
          <path d="M300 300 L334 256 L368 300 Z" fill="#f1dfbb" />
          <path d="M334 256 L368 300 L346 300 Z" fill="#e0c391" />
        </g>
        {/* back dune */}
        <path
          d="M0 300 C70 268 150 286 220 300 S350 270 420 292 V520 H0 Z"
          fill="url(#dl-dune-back)"
        />
        {/* front dunes */}
        <path
          d="M0 360 C90 320 170 350 240 372 S360 352 420 366 V520 H0 Z"
          fill="url(#dl-dune-front)"
        />
        <path
          d="M0 360 C90 320 170 350 240 372"
          fill="none"
          stroke="#f6e3bd"
          strokeWidth="2"
          opacity="0.7"
        />
        {/* trail over the dunes and a caravan walking it */}
        <path
          className="desert-trail"
          d="M-20 372 C60 360 120 372 180 388 S300 418 440 404"
          fill="none"
          stroke="#b98c4f"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="1 9"
        />
        <g className="desert-caravan" fill="#9c7342">
          {[0, 64, 128].map((x, i) => (
            <g key={x} transform={`translate(${-x} 0)`}>
              <g className="desert-camel" style={{ animationDelay: `${i * -0.35}s` }}>
                <path d="M6 0 L8 -17 C4 -20 4 -26 8 -28 C12 -40 22 -42 28 -32 C32 -28 36 -28 40 -30 C44 -32 46 -40 48 -46 C49 -49 53 -50 56 -48 L58 -46 C59 -45 58 -44 57 -44 L52 -44 C50 -38 48 -30 44 -24 L44 -17 L46 0 L43 0 L41 -15 L38 -15 L39 0 L36 0 L34 -16 L18 -16 L17 0 L14 0 L13 -15 L11 -15 L10 0 Z" />
              </g>
            </g>
          ))}
        </g>
        <path
          d="M0 430 C110 404 210 430 300 450 S400 440 420 446 V520 H0 Z"
          fill="#cf9f5c"
          opacity="0.55"
        />
      </svg>

      <svg
        className="desert-side desert-right"
        viewBox="0 0 420 520"
        preserveAspectRatio="xMaxYMax meet"
        focusable="false"
      >
        <defs>
          <linearGradient id="dr-dune" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ecd3a2" />
            <stop offset="1" stopColor="#dcb172" />
          </linearGradient>
        </defs>
        <path d="M0 330 C80 300 170 312 260 296 S380 300 420 310 V520 H0 Z" fill="#f2deb5" />
        {/* palms */}
        <g className="desert-palm desert-palm-big">
          <path
            d="M300 420 C296 360 304 300 322 236"
            stroke="#8a6a44"
            strokeWidth="9"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M300 420 C296 360 304 300 322 236"
            stroke="#a7845a"
            strokeWidth="9"
            strokeDasharray="3 9"
            fill="none"
          />
          <g fill="#4f7a52">
            <path d="M322 236 C290 214 252 218 226 238 C258 230 290 232 322 240 Z" />
            <path d="M322 236 C300 200 266 188 236 194 C266 206 292 220 320 240 Z" />
            <path d="M322 236 C328 198 352 176 384 172 C360 190 342 210 326 240 Z" />
            <path d="M322 236 C356 224 392 232 412 256 C384 244 354 240 324 242 Z" />
            <path d="M322 236 C340 244 356 266 360 292 C346 270 334 256 320 244 Z" />
            <path d="M322 236 C304 248 290 268 286 292 C300 270 310 256 324 244 Z" />
          </g>
          <circle cx="318" cy="246" r="5" fill="#7a5a32" />
          <circle cx="328" cy="248" r="4.5" fill="#6d4f2b" />
        </g>
        <g className="desert-palm desert-palm-small">
          <path
            d="M186 400 C184 366 190 336 202 306"
            stroke="#8a6a44"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
          />
          <g fill="#628d5f">
            <path d="M202 306 C182 292 158 294 142 308 C162 302 182 304 202 310 Z" />
            <path d="M202 306 C206 282 222 268 244 266 C228 278 216 292 206 310 Z" />
            <path d="M202 306 C226 298 250 304 262 320 C244 312 224 310 204 312 Z" />
            <path d="M202 306 C190 284 170 274 150 276 C170 286 186 296 200 312 Z" />
          </g>
        </g>
        <path d="M0 410 C100 372 200 392 280 404 S400 388 420 392 V520 H0 Z" fill="url(#dr-dune)" />
        <path
          d="M120 400 C200 380 280 396 420 392"
          fill="none"
          stroke="#f6e3bd"
          strokeWidth="2"
          opacity="0.7"
        />
        <path
          d="M0 460 C120 440 240 456 330 468 S410 462 420 464 V520 H0 Z"
          fill="#cf9f5c"
          opacity="0.5"
        />
      </svg>
    </div>
  );
}
