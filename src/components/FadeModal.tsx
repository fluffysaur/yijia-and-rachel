import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { clsx } from "clsx";

export function FadeModal({
  open,
  title,
  children,
  onClose,
  closeDisabled = false
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  closeDisabled?: boolean;
}) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !closeDisabled) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeDisabled, onClose, open]);

  return (
    <div
      className={clsx(
        "fixed inset-0 z-50 bg-ink/30 px-4 py-10 transition-opacity duration-300",
        open ? "opacity-100" : "pointer-events-none opacity-0"
      )}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      aria-hidden={!open}
    >
      <div
        className={clsx(
          "relative mx-auto max-h-[calc(100vh-5rem)] max-w-3xl overflow-y-auto border border-taupe/20 bg-white p-6 shadow-[0_20px_60px_rgba(51,43,39,0.12)] transition-all duration-300 md:p-8 before:pointer-events-none before:absolute before:inset-2 before:border before:border-taupe/10",
          open ? "translate-y-0 scale-100 opacity-100" : "translate-y-3 scale-[0.98] opacity-0"
        )}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <h2 className="font-display text-4xl text-ink">{title}</h2>
          <button
            className="inline-flex size-10 cursor-pointer items-center justify-center rounded-xs border border-taupe/20 text-ink transition hover:border-ink hover:bg-cream/60 disabled:cursor-not-allowed disabled:opacity-40"
            type="button"
            aria-label={`Close ${title}`}
            onClick={onClose}
            disabled={closeDisabled}
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
