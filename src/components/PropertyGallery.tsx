import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { ChevronLeft, ChevronRight, Expand, ImageOff, Loader2, X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import type { Property } from "@/data/types";
import { SiteText } from "./SiteText";

export function PropertyGallery({ p }: { p: Pick<Property, "images" | "title"> }) {
  const images = [...p.images].sort((a, b) => a.position - b.position);
  const [selected, setSelected] = useState(0);
  const [direction, setDirection] = useState(1);
  const [expanded, setExpanded] = useState(false);
  const [loaded, setLoaded] = useState("");
  const [failed, setFailed] = useState("");
  const rail = useRef<HTMLDivElement>(null);
  const gesture = useRef<{ x: number; y: number } | null>(null);
  const index = Math.min(selected, Math.max(0, images.length - 1));
  const image = images[index];
  const loading = Boolean(image && loaded !== image.src && failed !== image.src);

  useEffect(() => {
    const thumbnail = rail.current?.querySelector<HTMLElement>(`[data-thumbnail="${index}"]`);
    if (thumbnail && rail.current) {
      rail.current.scrollTo({
        left: thumbnail.offsetLeft - rail.current.clientWidth / 2 + thumbnail.offsetWidth / 2,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
    }
  }, [index]);

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
          {loading && (
            <span className="property-gallery-loading" role="status">
              <Loader2 className="animate-spin" size={24} />
              <span className="sr-only">
                <SiteText>{"Načítám fotografii…"}</SiteText>
              </span>
            </span>
          )}
          {failed === image.src && (
            <div className="property-gallery-error">
              <ImageOff aria-hidden />
              <SiteText>{"Fotografii se nepodařilo načíst."}</SiteText>
            </div>
          )}
          {arrows}
          <Dialog.Trigger asChild>
            <button type="button" className="property-gallery-expand">
              <Expand size={16} />
              <SiteText>{"Zvětšit"}</SiteText>
            </button>
          </Dialog.Trigger>
          <span className="property-gallery-count" aria-live="polite" aria-atomic="true">
            {index + 1} / {images.length}
          </span>
        </div>
        <div className="property-gallery-caption">
          <span>{image.alt}</span>
          <span>
            <SiteText>{"Fotogalerie"}</SiteText>
          </span>
        </div>
        {images.length > 1 && (
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
        )}
      </section>
      <Dialog.Portal>
        <Dialog.Overlay className="property-lightbox-overlay" />
        <Dialog.Content
          className="property-lightbox"
          onKeyDown={keyboard}
          aria-describedby={undefined}
        >
          <Dialog.Title className="sr-only">{p.title}</Dialog.Title>
          <Dialog.Close className="property-lightbox-close" aria-label="Zavřít fotogalerii">
            <X size={24} />
          </Dialog.Close>
          <div className="property-lightbox-stage">
            {photo}
            {arrows}
          </div>
          <p className="property-lightbox-caption">
            <span>{image.alt}</span>
            <span aria-live="polite">
              {index + 1} / {images.length}
            </span>
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
