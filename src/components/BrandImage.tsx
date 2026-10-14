import type { ImgHTMLAttributes } from "react";
export function BrandImage({
  asset,
  ...props
}: ImgHTMLAttributes<HTMLImageElement> & { asset: { url: string; original_filename: string } }) {
  if (asset.url) return <img {...props} src={asset.url} />;
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
