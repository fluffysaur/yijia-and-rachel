import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect } from "react";
import type { GalleryImage } from "../types/wedding";

export function GalleryModal({
  images,
  activeIndex,
  onClose,
  onChange
}: {
  images: GalleryImage[];
  activeIndex: number;
  onClose: () => void;
  onChange: (index: number) => void;
}) {
  const activeImage = images[activeIndex];
  const showPrevious = useCallback(() => onChange((activeIndex - 1 + images.length) % images.length), [
    activeIndex,
    images.length,
    onChange
  ]);
  const showNext = useCallback(() => onChange((activeIndex + 1) % images.length), [activeIndex, images.length, onChange]);

  useEffect(() => {
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") showPrevious();
      if (event.key === "ArrowRight") showNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.documentElement.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, showNext, showPrevious]);

  return (
    <div className="fixed inset-0 z-50 bg-ink/92 text-white" role="dialog" aria-modal="true" aria-label="Gallery">
      <button
        className="absolute right-4 top-4 z-10 inline-flex size-11 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/10 transition hover:bg-white/20"
        aria-label="Close gallery"
        onClick={onClose}
      >
        <X size={20} />
      </button>
      <button
        className="absolute left-4 top-1/2 z-10 inline-flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/10 transition hover:bg-white/20"
        aria-label="Previous image"
        onClick={showPrevious}
      >
        <ChevronLeft size={22} />
      </button>
      <button
        className="absolute right-4 top-1/2 z-10 inline-flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/10 transition hover:bg-white/20"
        aria-label="Next image"
        onClick={showNext}
      >
        <ChevronRight size={22} />
      </button>
      <div className="flex h-full flex-col items-center justify-center gap-5 px-4 py-16">
        <img src={activeImage.src} alt={activeImage.alt} className="max-h-[74vh] max-w-full rounded-lg object-contain shadow-2xl" />
        <div className="text-center text-sm text-white/75">
          <p>{activeImage.alt}</p>
          <p className="mt-1">
            {activeIndex + 1} / {images.length}
          </p>
        </div>
      </div>
    </div>
  );
}
