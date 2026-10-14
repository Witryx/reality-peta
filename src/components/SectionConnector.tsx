import logo from "@/assets/petr-pavlat-logo.png.asset.json";
import logoOutline from "@/assets/petr-pavlat-logo-outline.json";
import { BrandImage } from "./BrandImage";

type SectionConnectorProps = { variant?: "doorway" | "horizon" | "perspective" };

/** Decorative route between chapters; never intercepts clicks or carries content. */
export function SectionConnector({ variant = "doorway" }: SectionConnectorProps) {
  return (
    <div
      className={`section-connector connector-${variant}`}
      data-reveal="connector"
      aria-hidden="true"
    >
      <div className="container-page connector-canvas">
        <svg
          className="connector-route"
          viewBox="0 0 1200 100"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            className="connector-guide"
            d="M100 0 V22 Q100 50 130 50 H520 M680 50 H1070 Q1100 50 1100 78 V100"
          />
          <path
            className="connector-ink connector-incoming"
            pathLength="1"
            d="M100 0 V22 Q100 50 130 50 H520"
          />
          <path
            className="connector-ink connector-outgoing"
            pathLength="1"
            d="M680 50 H1070 Q1100 50 1100 78 V100"
          />
        </svg>
        {variant === "doorway" ? (
          <div className="connector-motif connector-logo">
            {logo.url ? (
              <>
                <svg
                  className="connector-logo-outline"
                  viewBox={`0 0 ${logoOutline.width} ${logoOutline.height}`}
                  fill="none"
                >
                  {logoOutline.paths.map((d, index) => (
                    <path key={index} className="connector-detail" pathLength="1" d={d} />
                  ))}
                </svg>
                <span
                  className="connector-logo-fill"
                  style={{ maskImage: `url("${logo.url}")`, WebkitMaskImage: `url("${logo.url}")` }}
                />
              </>
            ) : (
              <BrandImage
                asset={logo}
                alt=""
                width={56}
                height={56}
                className="size-14 object-contain"
              />
            )}
          </div>
        ) : (
          <svg className="connector-motif" viewBox="0 0 100 80" fill="none">
            {variant === "horizon" ? (
              <>
                <path className="connector-sun-fill" d="M34 34 A16 16 0 0 1 66 34 Z" />
                <path className="connector-detail" pathLength="1" d="M34 34 A16 16 0 0 1 66 34" />
                <path
                  className="connector-detail"
                  pathLength="1"
                  d="M12 40 H88 M18 51 C30 43 40 59 52 51 S74 43 86 51"
                />
                <path
                  className="connector-secondary"
                  pathLength="1"
                  d="M26 62 C38 54 48 70 60 62 S74 57 80 60"
                />
                <path
                  className="connector-sun-rays"
                  pathLength="1"
                  d="M50 7 V12 M27 14 L31 18 M73 14 L69 18 M20 30 H25 M75 30 H80"
                />
              </>
            ) : (
              <>
                <path
                  className="connector-detail"
                  pathLength="1"
                  d="M24 58 V18 H64 V58 H24 L38 70 H78 V30 L64 18 M64 58 L78 70 M24 18 L38 30 H78 M38 30 V70"
                />
              </>
            )}
          </svg>
        )}
      </div>
    </div>
  );
}
