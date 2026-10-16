import { useEffect, useId, useRef, useState, type PointerEvent } from "react";
import { ArrowDown, ArrowUp, GripVertical, Trash2 } from "lucide-react";
import type { PropertyImage } from "@/data/types";

export function PropertyImagesEditor({
  images,
  onChange,
}: {
  images: PropertyImage[];
  onChange: (images: PropertyImage[]) => void;
}) {
  const grid = useRef<HTMLDivElement>(null);
  const helpId = useId();
  const [drag, setDrag] = useState<{ index: number; x: number; y: number } | null>(null);
  const [target, setTarget] = useState<number | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const point = useRef({ x: 0, y: 0 });
  const dragging = drag !== null;

  function findTarget(x: number, y: number) {
    const bounds = grid.current?.getBoundingClientRect();
    if (!bounds || x < bounds.left || x > bounds.right || y < bounds.top || y > bounds.bottom)
      return null;
    const cards = Array.from(grid.current!.querySelectorAll<HTMLElement>("[data-photo-index]"));
    let closest: number | null = null;
    let distance = Infinity;
    cards.forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      const next = Math.hypot(x - (rect.left + rect.width / 2), y - (rect.top + rect.height / 2));
      if (next < distance) {
        closest = index;
        distance = next;
      }
    });
    return closest;
  }

  // Only the grip disables touch scrolling; the rest of each card scrolls normally.
  useEffect(() => {
    if (!dragging) return;
    let frame: number;
    let lastTime = 0;
    function scroll(time: number) {
      const edge = 90;
      const y = point.current.y;
      const direction =
        y < edge
          ? -Math.min(1, (edge - y) / edge)
          : y > window.innerHeight - edge
            ? Math.min(1, (y - window.innerHeight + edge) / edge)
            : 0;
      if (direction && lastTime) {
        window.scrollBy(0, direction * Math.min(time - lastTime, 32) * 0.65);
        setTarget(findTarget(point.current.x, y));
      }
      lastTime = time;
      frame = requestAnimationFrame(scroll);
    }
    frame = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(frame);
  }, [dragging]);

  function move(from: number, to: number) {
    if (to < 0 || to >= images.length || from === to) return;
    const next = [...images];
    const [image] = next.splice(from, 1);
    next.splice(to, 0, image!);
    onChange(next.map((item, position) => ({ ...item, position })));
    setAnnouncement(`Fotografie přesunuta z pozice ${from + 1} na pozici ${to + 1}.`);
  }
  function finish(event: PointerEvent<HTMLButtonElement>) {
    if (!drag) return;
    const destination = findTarget(event.clientX, event.clientY);
    if (destination !== null) move(drag.index, destination);
    setDrag(null);
    setTarget(null);
  }

  return (
    <>
      <p id={helpId} className="sr-only">
        Táhněte za úchyt. Klávesnicí použijte šipky vedle fotografie nebo vyberte cílovou pozici.
        Escape zruší přetažení.
      </p>
      <p className="sr-only" role="status">
        {announcement}
      </p>
      <div ref={grid} className={`admin-gallery-grid ${dragging ? "is-sorting" : ""}`}>
        {images.map((image, i) => (
          <div
            key={`${image.src}-${i}`}
            data-photo-index={i}
            className={`admin-gallery-item ${drag?.index === i ? "is-dragging" : ""} ${target === i && drag?.index !== i ? "is-drop-target" : ""}`}
          >
            <div>
              <img src={image.src} alt={image.alt} draggable={false} />
              {i === 0 && <span className="admin-cover-label">Titulní fotografie</span>}
              <button
                type="button"
                className="admin-photo-grip"
                aria-label={`Přetáhnout fotografii ${i + 1}`}
                aria-describedby={helpId}
                disabled={images.length < 2}
                onPointerDown={(event) => {
                  if (event.button !== 0) return;
                  event.preventDefault();
                  event.currentTarget.focus();
                  event.currentTarget.setPointerCapture(event.pointerId);
                  point.current = { x: event.clientX, y: event.clientY };
                  setDrag({ index: i, ...point.current });
                  setTarget(i);
                }}
                onPointerMove={(event) => {
                  if (!drag) return;
                  point.current = { x: event.clientX, y: event.clientY };
                  setDrag({ index: drag.index, ...point.current });
                  setTarget(findTarget(event.clientX, event.clientY));
                }}
                onPointerUp={finish}
                onPointerCancel={() => {
                  setDrag(null);
                  setTarget(null);
                }}
                onLostPointerCapture={() => {
                  setDrag(null);
                  setTarget(null);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setDrag(null);
                    setTarget(null);
                  }
                }}
              >
                <GripVertical size={21} />
                <span>Přesunout</span>
              </button>
              {target === i && drag?.index !== i && (
                <span className="admin-photo-drop-label">Přesunout na {i + 1}. pozici</span>
              )}
            </div>
            <input
              aria-label={`Popis fotografie ${i + 1}`}
              value={image.alt}
              maxLength={300}
              onChange={(event) =>
                onChange(
                  images.map((item, index) =>
                    index === i ? { ...item, alt: event.target.value } : item,
                  ),
                )
              }
            />
            <div className="admin-image-actions">
              <select
                aria-label={`Pozice fotografie ${i + 1}`}
                value={i}
                onChange={(event) => move(i, Number(event.target.value))}
              >
                {images.map((_, position) => (
                  <option key={position} value={position}>
                    {position + 1}. {position === 0 ? "titulní" : "pozice"}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={i === 0}
                onClick={() => move(i, i - 1)}
                aria-label="Posunout fotografii dopředu"
              >
                <ArrowUp size={16} />
              </button>
              <button
                type="button"
                disabled={i === images.length - 1}
                onClick={() => move(i, i + 1)}
                aria-label="Posunout fotografii dozadu"
              >
                <ArrowDown size={16} />
              </button>
              <button
                type="button"
                aria-label="Odebrat fotografii z galerie"
                onClick={() =>
                  onChange(
                    images
                      .filter((_, index) => index !== i)
                      .map((item, position) => ({ ...item, position })),
                  )
                }
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
      {drag && images[drag.index] && (
        <div
          className="admin-photo-drag-preview"
          style={{ left: drag.x + 16, top: drag.y + 16 }}
          aria-hidden="true"
        >
          <img src={images[drag.index]!.src} alt="" />
          <span>
            {target === null ? "Vyberte pozici v galerii" : `${drag.index + 1} → ${target + 1}`}
          </span>
        </div>
      )}
    </>
  );
}
