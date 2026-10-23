import type { ImgHTMLAttributes } from "react";
import { useWebsiteImage, useWebsiteImageAlt } from "@/lib/website-context";
import type { WebsiteImageKey } from "@/data/website-images";

export function SiteImage({
  imageKey,
  src,
  ...props
}: ImgHTMLAttributes<HTMLImageElement> & { imageKey: WebsiteImageKey }) {
  const image = useWebsiteImage(imageKey, src ?? "");
  const alt = useWebsiteImageAlt(imageKey, props.alt ?? "");
  if (!image) return null;
  return <img {...props} src={image} alt={alt} />;
}
