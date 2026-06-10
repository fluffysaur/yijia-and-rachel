import { X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { clsx } from "clsx";
import { RsvpContent } from "./RsvpContent";
import { RsvpModalContext } from "./RsvpModalContext";

export function RsvpModalProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  const openRsvp = useCallback(() => {
    setMounted(true);
    window.requestAnimationFrame(() => setVisible(true));
  }, []);

  const closeRsvp = useCallback(() => {
    setVisible(false);
    window.setTimeout(() => setMounted(false), 520);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeRsvp();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.documentElement.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [closeRsvp, mounted]);

  const value = useMemo(() => ({ openRsvp, closeRsvp }), [closeRsvp, openRsvp]);

  return (
    <RsvpModalContext.Provider value={value}>
      {children}
      {mounted ? (
        <div
          className={clsx(
            "fixed inset-0 z-50 bg-white/95 backdrop-blur-md transition-opacity duration-500 ease-out",
            visible ? "opacity-100" : "pointer-events-none opacity-0"
          )}
          role="dialog"
          aria-modal="true"
          aria-label="RSVP"
        >
          <button
            className="absolute right-4 top-4 z-10 inline-flex size-11 cursor-pointer items-center justify-center rounded-full border border-taupe/15 bg-white text-ink shadow-sm transition hover:border-rose/40 hover:bg-cream"
            aria-label="Close RSVP"
            onClick={closeRsvp}
          >
            <X size={20} />
          </button>
          <div
            className={clsx(
              "h-full overflow-y-auto px-4 py-16 transition-all duration-500 ease-out md:px-8",
              visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            )}
          >
            <div className="mx-auto max-w-4xl">
              <RsvpContent compact />
            </div>
          </div>
        </div>
      ) : null}
    </RsvpModalContext.Provider>
  );
}
