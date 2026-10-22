import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from "react";
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
  const suppressClick = useRef(false);
  const opener = useRef<HTMLButtonElement | null>(null);
  const stage = useRef<HTMLButtonElement>(null);
  const index = Math.min(selected, Math.max(0, images.length - 1));
  const image = images[index];
  const previews = images
    .map((item, i) => ({ item, i }))
    .filter(({ i }) => i !== index)
    .slice(0, 2);
  const loading = Boolean(image && loaded !== image.src && failed !== image.src);
  const imageReady = useCallback((node: HTMLImageElement | null) => {
    if (node?.complete && node.naturalWidth > 0) {
      node.dataset["orientation"] =
        node.naturalHeight > node.naturalWidth ? "portrait" : "landscape";
      setLoaded(node.getAttribute("src") ?? "");
      setFailed("");
    }
  }, []);

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
    suppressClick.current = Math.abs(dx) > 10 || Math.abs(dy) > 10;
    if (images.length > 1 && Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      const step = dx < 0 ? 1 : -1;
      select(index + step, step);
    }
  }
  function openPhoto(event: MouseEvent<HTMLButtonElement>) {
    opener.current = event.currentTarget;
    setDialogView("photo");
    setExpanded(true);
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
      ref={imageReady}
      fetchPriority="high"
      draggable={false}
      className="property-gallery-image"
      data-direction={direction}
      onLoad={(event) => {
        imageReady(event.currentTarget);
        setLoaded(image.src);
        setFailed("");
      }}
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
        <span className="property-gallery-error">
          <ImageOff aria-hidden />
          <SiteText>{"Fotografii se nepodařilo načíst."}</SiteText>
        </span>
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
        <div
          className={`property-gallery-media ${images.length === 1 ? "is-single" : ""} ${images.length === 2 ? "has-two" : ""}`}
        >
          <div className="property-gallery-main">
            <div className="property-gallery-photo-area">
              <button
                type="button"
                className="property-gallery-stage"
                ref={stage}
                aria-label={`Zvětšit fotografii ${index + 1}`}
                aria-haspopup="dialog"
                aria-busy={loading}
                onClick={(event) => {
                  if (suppressClick.current) {
                    suppressClick.current = false;
                    return;
                  }
                  openPhoto(event);
                }}
                onPointerDown={(event) => {
                  suppressClick.current = false;
                  gesture.current = { x: event.clientX, y: event.clientY };
                  event.currentTarget.setPointerCapture(event.pointerId);
                }}
                onPointerUp={swipe}
                onPointerCancel={() => {
                  gesture.current = null;
                  suppressClick.current = true;
                }}
              >
                {photo}
                {feedback}
              </button>
              {arrows}
            </div>
          </div>
          {images.length > 1 && (
            <aside className="property-gallery-previews" aria-label="Další pohledy na nemovitost">
              {previews.map(({ item, i }) => (
                <button
                  type="button"
                  key={`${item.src}-${i}`}
                  onClick={(event) => {
                    select(i);
                    openPhoto(event);
                  }}
                  aria-label={`Otevřít fotografii ${i + 1}`}
                  aria-haspopup="dialog"
                >
                  <img src={item.src} alt="" loading="lazy" width={640} height={420} />
                  <span className="property-gallery-preview-expand" aria-hidden="true">
                    <Expand size={18} />
                  </span>
                </button>
              ))}
            </aside>
          )}
        </div>
        <div className="property-gallery-toolbar">
          <div className="property-gallery-navigation">
            <p className="property-gallery-label">
              <SiteText>{"Fotografie"}</SiteText>
            </p>
            <span className="property-gallery-count" aria-live="polite" aria-atomic="true">
              {index + 1} / {images.length}
            </span>
          </div>
          <div className="property-gallery-actions">
            <button
              type="button"
              className="property-gallery-expand"
              onClick={openPhoto}
              aria-haspopup="dialog"
            >
              <Expand size={16} aria-hidden="true" />
              <SiteText>{"Zvětšit"}</SiteText>
            </button>
            {images.length > 1 && (
              <button
                type="button"
                className="property-gallery-overview-button"
                aria-haspopup="dialog"
                onClick={(event) => {
                  opener.current = event.currentTarget;
                  setDialogView("overview");
                  setExpanded(true);
                }}
              >
                <Grid2X2 size={15} aria-hidden="true" />
                <SiteText>{"Zobrazit všechny"}</SiteText>
              </button>
            )}
          </div>
        </div>
        {images.length > 1 && (
          <div ref={rail} className="property-gallery-thumbnails" aria-label="Náhledy fotografií">
            {images.map((item, i) => (
              <button
                type="button"
                key={`${item.src}-${i}`}
                data-thumbnail={i}
                onClick={(event) => {
                  select(i);
                  openPhoto(event);
                }}
                aria-label={`Zobrazit fotografii ${i + 1}`}
                aria-haspopup="dialog"
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
          onKeyDown={dialogView === "photo" ? keyboard : undefined}
          aria-describedby={undefined}
          onCloseAutoFocus={(event) => {
            const target = opener.current?.isConnected ? opener.current : stage.current;
            if (target) {
              event.preventDefault();
              target.focus({ preventScroll: true });
            }
          }}
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
                <span className="property-lightbox-description">{image.alt}</span>
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
