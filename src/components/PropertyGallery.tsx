import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { ChevronLeft, ChevronRight, Expand, Grid2X2, ImageOff, Loader2, X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import type { Property } from "@/data/types";
import { SiteText } from "./SiteText";

export function PropertyGallery({ p }: { p: Pick<Property, "images" | "title"> }) {
  const images = [...p.images].sort((a, b) => a.position - b.position);
  const [selected, setSelected] = useState(0);
  const [direction, setDirection] = useState(1);
  const [expanded, setExpanded] = useState(false);
  const [dialogView, setDialogView] = useState<"photo" | "overview">("photo");
  const [loaded, setLoaded] = useState("");
  const [failed, setFailed] = useState("");
  const rail = useRef<HTMLDivElement>(null);
  const viewer = useRef<HTMLDivElement>(null);
  const overview = useRef<HTMLDivElement>(null);
  const gesture = useRef<{ x: number; y: number } | null>(null);
  const index = Math.min(selected, Math.max(0, images.length - 1));
  const image = images[index];
  const loading = Boolean(image && loaded !== image.src && failed !== image.src);

  useEffect(() => {
    const thumbnail = rail.current?.querySelector<HTMLElement>(`[data-thumbnail="${index}"]`);
    if (thumbnail && rail.current) {
      rail.current.scrollTo({
        left: thumbnail.offsetLeft - rail.current.clientWidth / 2 + thumbnail.offsetWidth / 2,
        top: thumbnail.offsetTop - rail.current.clientHeight / 2 + thumbnail.offsetHeight / 2,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
    }
  }, [index]);

  useEffect(() => {
    if (expanded)
      (dialogView === "photo" ? viewer : overview).current?.focus({ preventScroll: true });
  }, [expanded, dialogView]);

  function select(next: number, step = next > index ? 1 : -1) {
    setDirection(step);
    setSelected((next + images.length) % images.length);
  }
  function keyboard(event: KeyboardEvent) {
    if (images.length < 2) return;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      const step = event.key === "ArrowLeft" ? -1 : 1;
      select(index + step, step);
    }
  }
  function swipe(event: PointerEvent) {
    if (!gesture.current) return;
    const dx = event.clientX - gesture.current.x;
    const dy = event.clientY - gesture.current.y;
    gesture.current = null;
    if (images.length > 1 && Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      const step = dx < 0 ? 1 : -1;
      select(index + step, step);
    }
  }
  const arrows = images.length > 1 && (
    <>
      <button
        type="button"
        onClick={() => select(index - 1, -1)}
        aria-label="Předchozí fotografie"
        className="property-gallery-arrow previous"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        type="button"
        onClick={() => select(index + 1, 1)}
        aria-label="Další fotografie"
        className="property-gallery-arrow next"
      >
        <ChevronRight size={24} />
      </button>
    </>
  );
  const photo = image && (
    <img
      key={image.src}
      src={image.src}
      alt={image.alt}
      width={1600}
      height={1066}
      draggable={false}
      className="property-gallery-image"
      data-direction={direction}
      onLoad={() => setLoaded(image.src)}
      onError={() => setFailed(image.src)}
    />
  );
  const feedback = (
    <>
      {loading && (
        <span className="property-gallery-loading" role="status">
          <Loader2 className="animate-spin" size={24} />
          <span className="sr-only">
            <SiteText>{"Načítám fotografii…"}</SiteText>
          </span>
        </span>
      )}
      {failed === image?.src && (
        <div className="property-gallery-error">
          <ImageOff aria-hidden />
          <SiteText>{"Fotografii se nepodařilo načíst."}</SiteText>
        </div>
      )}
    </>
  );

  if (!image)
    return (
      <div className="property-gallery-empty">
        <ImageOff size={30} aria-hidden />
        <SiteText>{"Fotografii připravujeme"}</SiteText>
      </div>
    );

  return (
    <Dialog.Root open={expanded} onOpenChange={setExpanded}>
      <section
        className="property-gallery"
        aria-label="Fotografie nemovitosti"
        onKeyDown={keyboard}
      >
        <div className={`property-gallery-layout ${images.length === 1 ? "is-single" : ""}`}>
          <div className="property-gallery-main">
            <div className="property-gallery-photo-area">
              <div
                className="property-gallery-stage"
                aria-busy={loading}
                onPointerDown={(event) => {
                  if (event.target instanceof Element && event.target.closest("button")) return;
                  gesture.current = { x: event.clientX, y: event.clientY };
                  event.currentTarget.setPointerCapture(event.pointerId);
                }}
                onPointerUp={swipe}
                onPointerCancel={() => {
                  gesture.current = null;
                }}
              >
                {photo}
                {feedback}
              </div>
            </div>
            <div className="property-gallery-toolbar">
              <div className="property-gallery-navigation">
                {arrows}
                <span className="property-gallery-count" aria-live="polite" aria-atomic="true">
                  {index + 1} / {images.length}
                </span>
              </div>
              <Dialog.Trigger asChild>
                <button
                  type="button"
                  className="property-gallery-expand"
                  onClick={() => setDialogView("photo")}
                >
                  <Expand size={16} />
                  <SiteText>{"Zvětšit"}</SiteText>
                </button>
              </Dialog.Trigger>
            </div>
          </div>
          {images.length > 1 && (
            <aside className="property-gallery-sidebar" aria-label="Náhledy fotografií">
              <div className="property-gallery-sidebar-heading">
                <p>
                  <SiteText>{"Fotografie"}</SiteText>
                </p>
                <button
                  type="button"
                  className="property-gallery-overview-button"
                  onClick={() => {
                    setDialogView("overview");
                    setExpanded(true);
                  }}
                >
                  <Grid2X2 size={15} aria-hidden="true" />
                  <SiteText>{"Zobrazit všechny"}</SiteText>
                </button>
              </div>
              <div ref={rail} className="property-gallery-thumbnails">
                {images.map((item, i) => (
                  <button
                    type="button"
                    key={`${item.src}-${i}`}
                    data-thumbnail={i}
                    onClick={() => select(i)}
                    aria-label={`Zobrazit fotografii ${i + 1}`}
                    aria-current={i === index ? "true" : undefined}
                  >
                    <img
                      src={item.src}
                      alt=""
                      loading="lazy"
                      width={160}
                      height={110}
                      draggable={false}
                    />
                    <span>{i + 1}</span>
                  </button>
                ))}
              </div>
            </aside>
          )}
        </div>
      </section>
      <Dialog.Portal>
        <Dialog.Overlay className="property-lightbox-overlay" />
        <Dialog.Content
          className="property-lightbox"
          onKeyDown={dialogView === "photo" ? keyboard : undefined}
          aria-describedby={undefined}
        >
          <div className="property-lightbox-header">
            <Dialog.Title>{p.title}</Dialog.Title>
            {dialogView === "photo" && images.length > 1 && (
              <button
                type="button"
                className="property-lightbox-overview-button"
                onClick={() => setDialogView("overview")}
              >
                <Grid2X2 size={16} aria-hidden="true" />
                <SiteText>{"Přehled fotografií"}</SiteText>
              </button>
            )}
          </div>
          <Dialog.Close className="property-lightbox-close" aria-label="Zavřít fotogalerii">
            <X size={24} />
          </Dialog.Close>
          {dialogView === "overview" ? (
            <div
              ref={overview}
              tabIndex={-1}
              className="property-lightbox-grid"
              aria-label="Všechny fotografie"
            >
              {images.map((item, i) => (
                <button
                  type="button"
                  key={`${item.src}-${i}`}
                  onClick={() => {
                    select(i);
                    setDialogView("photo");
                  }}
                  aria-label={`Otevřít fotografii ${i + 1}`}
                  aria-current={i === index ? "true" : undefined}
                >
                  <img src={item.src} alt="" loading="lazy" width={400} height={270} />
                  <span>
                    {i + 1} / {images.length}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <>
              <div
                ref={viewer}
                tabIndex={-1}
                className="property-lightbox-stage"
                aria-busy={loading}
              >
                {photo}
                {feedback}
                {arrows}
              </div>
              <p className="property-lightbox-caption">
                <span aria-live="polite">
                  {index + 1} / {images.length}
                </span>
              </p>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
