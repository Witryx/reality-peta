import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import type { Media } from "@/data/admin";
import { api } from "@/lib/api";
import { errorMessage, Notice } from "./AdminPanel";
import { useDialogFocus } from "./useDialogFocus";

export function ImagePicker({
  media,
  onSelect,
  onMediaChange,
  disabled = false,
  onBusy,
}: {
  media: Media[];
  onSelect: (src: string) => void;
  onMediaChange: () => Promise<unknown>;
  disabled?: boolean;
  onBusy?: (busy: boolean) => void;
}) {
  const [library, setLibrary] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);
  useDialogFocus(library, () => setLibrary(false));
  async function upload(file: File | undefined) {
    if (!file) return;
    if (file.size > 12 * 1024 * 1024) {
      setError("Fotografie může mít maximálně 12 MB.");
      return;
    }
    setBusy(true);
    onBusy?.(true);
    setError("");
    try {
      const result = await api<Media & { src: string }>(
        `/api/admin/media?name=${encodeURIComponent(file.name)}`,
        {
          method: "POST",
          body: file,
          headers: { "Content-Type": file.type || "application/octet-stream" },
        },
      );
      onSelect(result.src);
      await onMediaChange();
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
      onBusy?.(false);
      if (input.current) input.current.value = "";
    }
  }
  return (
    <>
      <div className="admin-image-actions">
        <input
          ref={input}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          hidden
          aria-label="Nahrát fotografii"
          onChange={(event) => void upload(event.target.files?.[0])}
        />
        <button
          type="button"
          className="admin-btn"
          disabled={busy || disabled}
          onClick={() => input.current?.click()}
        >
          {busy ? <Loader2 size={16} className="admin-spin" /> : <ImagePlus size={16} />} Nahrát
          novou
        </button>
        <button
          type="button"
          className="admin-btn"
          disabled={busy || disabled}
          onClick={() => setLibrary(true)}
        >
          Vybrat z knihovny
        </button>
      </div>
      {error && <Notice>{error}</Notice>}
      {library && (
        <div className="admin-dialog-backdrop">
          <section
            className="admin-dialog wide"
            role="dialog"
            aria-modal="true"
            aria-label="Vybrat fotografii"
          >
            <button
              type="button"
              className="admin-dialog-close"
              aria-label="Zavřít knihovnu"
              onClick={() => setLibrary(false)}
            >
              <X />
            </button>
            <h2>Vybrat fotografii</h2>
            <div className="admin-media-grid">
              {media.map((item) => (
                <button
                  type="button"
                  className="admin-library-item"
                  key={item.id}
                  onClick={() => {
                    onSelect(`/uploads/${item.filename}`);
                    setLibrary(false);
                  }}
                >
                  <img src={`/uploads/${item.filename}`} alt={item.original_name} loading="lazy" />
                  <span>{item.original_name}</span>
                </button>
              ))}
            </div>
            {!media.length && <p>Knihovna je prázdná. Nahrajte novou fotografii.</p>}
          </section>
        </div>
      )}
    </>
  );
}
