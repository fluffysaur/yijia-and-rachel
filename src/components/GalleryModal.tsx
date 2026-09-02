import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import type { GalleryImage } from "../types/wedding";

export function GalleryModal({
  images,
  activeIndex,
  onClose,
  onChange,
}: {
  images: GalleryImage[];
  activeIndex: number;
  onClose: () => void;
  onChange: (index: number) => void;
}) {
  const activeImage = images[activeIndex];
  const thumbnailListRef = useRef<HTMLDivElement>(null);
  const activeThumbRef = useRef<HTMLButtonElement>(null);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const minSwipeDistance = 50;

  const showPrevious = useCallback(
    () => onChange((activeIndex - 1 + images.length) % images.length),
    [activeIndex, images.length, onChange]
  );
  const showNext = useCallback(
    () => onChange((activeIndex + 1) % images.length),
    [activeIndex, images.length, onChange]
  );

  // Auto-scroll thumbnail strip to center the active thumbnail
  useEffect(() => {
    if (activeThumbRef.current) {
      activeThumbRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [activeIndex]);

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

  const handleTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > minSwipeDistance) {
      showNext();
    } else if (distance < -minSwipeDistance) {
      showPrevious();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-between bg-ink/95 text-white backdrop-blur-sm select-none"
      role="dialog"
      aria-modal="true"
      aria-label="Photo Gallery"
    >
      {/* Top bar with counter and close button */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4">
        <div className="font-serif text-base tracking-[0.2em] text-white/75">
          {activeIndex + 1} / {images.length}
        </div>
        <button
          className="inline-flex size-11 cursor-pointer items-center justify-center rounded-xs border border-white/20 bg-white/10 text-white transition duration-200 hover:border-white/50 hover:bg-white/20"
          aria-label="Close gallery"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>

      {/* Main image presentation area with swipe support */}
      <div
        className="relative flex flex-1 items-center justify-center px-4 md:px-16"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <button
          className="absolute left-4 top-1/2 z-10 hidden size-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-xs border border-white/20 bg-white/10 text-white transition hover:border-white/50 hover:bg-white/20 md:inline-flex"
          aria-label="Previous image"
          onClick={showPrevious}
        >
          <ChevronLeft size={24} />
        </button>

        <button
          className="absolute right-4 top-1/2 z-10 hidden size-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-xs border border-white/20 bg-white/10 text-white transition hover:border-white/50 hover:bg-white/20 md:inline-flex"
          aria-label="Next image"
          onClick={showNext}
        >
          <ChevronRight size={24} />
        </button>

        {activeImage ? (
          <img
            key={activeImage.src}
            src={activeImage.src}
            alt={activeImage.alt}
            className="max-h-[62vh] sm:max-h-[68vh] max-w-full rounded-none object-contain shadow-2xl transition-opacity duration-300"
          />
        ) : null}
      </div>

      {/* Bottom Thumbnail Strip */}
      <div className="relative z-10 w-full border-t border-white/10 bg-black/30 px-4 py-3 backdrop-blur-md">
        <div
          ref={thumbnailListRef}
          className="mx-auto flex max-w-5xl items-center gap-2 overflow-x-auto py-1 scroll-smooth"
          style={{ scrollbarWidth: "none" }}
        >
          {images.map((image, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={image.src}
                ref={isActive ? activeThumbRef : null}
                type="button"
                onClick={() => onChange(index)}
                aria-label={`Go to photo ${index + 1}`}
                className={`relative shrink-0 cursor-pointer overflow-hidden rounded-xs transition duration-200 ${
                  isActive
                    ? "ring-2 ring-white scale-105 opacity-100"
                    : "opacity-45 hover:opacity-85"
                }`}
              >
                <img
                  src={image.src}
                  alt=""
                  loading="lazy"
                  className="size-12 md:size-14 object-cover"
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
