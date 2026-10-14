import type { ImgHTMLAttributes } from "react";
import { useWebsiteImage, useWebsiteImageAlt } from "@/lib/website-context";
import type { WebsiteImageKey } from "@/data/website-images";
export function BrandImage({
  asset,
  imageKey,
  ...props
}: ImgHTMLAttributes<HTMLImageElement> & {
  asset: { url: string; original_filename: string };
  imageKey?: WebsiteImageKey;
}) {
  const src = useWebsiteImage(imageKey, asset.url);
  const alt = useWebsiteImageAlt(imageKey, props.alt ?? "");
  if (src) return <img {...props} src={src} alt={alt} />;
  return (
    <span
      className={`brand-media-placeholder ${props.className || ""}`}
      role="img"
      aria-label={props.alt || "Chybějící brandové médium"}
    >
      <span>
        {asset.original_filename.includes("logo")
          ? "PP"
          : asset.original_filename.includes("signature")
            ? "Podpis k doplnění"
            : "Portrét k doplnění"}
      </span>
    </span>
  );
}
