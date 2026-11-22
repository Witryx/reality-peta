import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import { SiteText } from "./SiteText";

/**
 * Share a listing: the phone's own share sheet where available (WhatsApp, Messenger, SMS…),
 * otherwise copy the link. No third-party scripts, so nothing loads before consent.
 */
export function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  async function share() {
    const url = window.location.href.split("?")[0] ?? window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        /* cancelled: fall back to copying */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt("Zkopírujte odkaz:", url);
    }
  }
  return (
    <button
      type="button"
      onClick={share}
      className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-accent underline-offset-2 hover:underline"
    >
      {copied ? (
        <Check className="size-4" aria-hidden />
      ) : (
        <Share2 className="size-4" aria-hidden />
      )}
      <SiteText>{copied ? "Odkaz zkopírován" : "Sdílet nabídku"}</SiteText>
    </button>
  );
}
