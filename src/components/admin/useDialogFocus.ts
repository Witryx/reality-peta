import { useEffect, useRef } from "react";
export function useDialogFocus(open: boolean, onClose: () => void) {
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const dialog = document.querySelector<HTMLElement>(".admin-dialog");
    if (!dialog) return;
    const targets = () =>
      Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), select, textarea, [tabindex="0"]',
        ),
      );
    targets()[0]?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function keydown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        close.current();
      }
      if (e.key !== "Tab") return;
      const list = targets();
      const first = list[0];
      const last = list.at(-1);
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
    dialog.addEventListener("keydown", keydown);
    return () => {
      dialog.removeEventListener("keydown", keydown);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [open]);
}
