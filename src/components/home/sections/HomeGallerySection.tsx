import { Eye, Images } from "lucide-react";
import { siteContent } from "../../../content/wedding";

export function HomeGallerySection({ onOpenImage }: { onOpenImage: (index: number) => void }) {
    // 4 portraits (indices 0, 1, 2, 3) and 2 landscapes (indices 4, 5)
    const p0 = siteContent.gallery[0];
    const p1 = siteContent.gallery[1];
    const p2 = siteContent.gallery[2];
    const p3 = siteContent.gallery[3];
    const l4 = siteContent.gallery[4];
    const l5 = siteContent.gallery[5];

    return (
        <section
            id="gallery"
            className="relative bg-white py-20"
        >
            <div className="section-shell">
                {/* Clean Editorial Header */}
                <div className="reveal mb-10 text-center md:text-left">
                    <p className="text-label uppercase tracking-widest text-rose">Pre-wedding shoot</p>
                    <h2 className="mt-2 font-display text-5xl md:text-6xl text-ink">Gallery</h2>
                </div>

                {/* Borderless Full-Bleed Editorial Grid */}
                <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8">
                    {/* Row 1: Portrait (5 cols) + Landscape (7 cols) - equal height full cover */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-12 sm:gap-6 lg:gap-8">
                        {p0 && (
                            <button
                                type="button"
                                className="reveal group relative block h-[380px] sm:h-[460px] lg:h-[540px] w-full cursor-pointer overflow-hidden p-0 text-left sm:col-span-5"
                                onClick={() => onOpenImage(0)}
                                aria-label="Open photo 1"
                            >
                                <img
                                    src={p0.src}
                                    alt={p0.alt}
                                    loading="lazy"
                                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 cursor-zoom-in"
                                />
                                <div className="pointer-events-none absolute inset-0 bg-ink/15 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                <div className="pointer-events-none absolute bottom-4 right-4 inline-flex items-center gap-2 bg-white/95 px-3 py-1 text-xs font-medium text-ink shadow-sm opacity-0 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                                    <Eye className="size-4 text-rose" />
                                    <span>Expand</span>
                                </div>
                            </button>
                        )}

                        {l4 && (
                            <button
                                type="button"
                                className="reveal group relative block h-[380px] sm:h-[460px] lg:h-[540px] w-full cursor-pointer overflow-hidden p-0 text-left sm:col-span-7"
                                onClick={() => onOpenImage(4)}
                                aria-label="Open photo 5"
                            >
                                <img
                                    src={l4.src}
                                    alt={l4.alt}
                                    loading="lazy"
                                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 cursor-zoom-in"
                                />
                                <div className="pointer-events-none absolute inset-0 bg-ink/15 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                <div className="pointer-events-none absolute bottom-4 right-4 inline-flex items-center gap-2 bg-white/95 px-3 py-1 text-xs font-medium text-ink shadow-sm opacity-0 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                                    <Eye className="size-4 text-rose" />
                                    <span>Expand</span>
                                </div>
                            </button>
                        )}
                    </div>

                    {/* Row 2: Twin Balanced Portraits (6 cols + 6 cols) */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:gap-8">
                        {p1 && (
                            <button
                                type="button"
                                className="reveal group relative block h-[380px] sm:h-[460px] lg:h-[540px] w-full cursor-pointer overflow-hidden p-0 text-left"
                                onClick={() => onOpenImage(1)}
                                aria-label="Open photo 2"
                            >
                                <img
                                    src={p1.src}
                                    alt={p1.alt}
                                    loading="lazy"
                                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 cursor-zoom-in"
                                />
                                <div className="pointer-events-none absolute inset-0 bg-ink/15 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                <div className="pointer-events-none absolute bottom-4 right-4 inline-flex items-center gap-2 bg-white/95 px-3 py-1 text-xs font-medium text-ink shadow-sm opacity-0 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                                    <Eye className="size-4 text-rose" />
                                    <span>Expand</span>
                                </div>
                            </button>
                        )}

                        {p2 && (
                            <button
                                type="button"
                                className="reveal group relative block h-[380px] sm:h-[460px] lg:h-[540px] w-full cursor-pointer overflow-hidden p-0 text-left"
                                onClick={() => onOpenImage(2)}
                                aria-label="Open photo 3"
                            >
                                <img
                                    src={p2.src}
                                    alt={p2.alt}
                                    loading="lazy"
                                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 cursor-zoom-in"
                                />
                                <div className="pointer-events-none absolute inset-0 bg-ink/15 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                <div className="pointer-events-none absolute bottom-4 right-4 inline-flex items-center gap-2 bg-white/95 px-3 py-1 text-xs font-medium text-ink shadow-sm opacity-0 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                                    <Eye className="size-4 text-rose" />
                                    <span>Expand</span>
                                </div>
                            </button>
                        )}
                    </div>

                    {/* Row 3: Landscape (7 cols) + Portrait (5 cols) - equal height full cover */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-12 sm:gap-6 lg:gap-8">
                        {l5 && (
                            <button
                                type="button"
                                className="reveal group relative block h-[380px] sm:h-[460px] lg:h-[540px] w-full cursor-pointer overflow-hidden p-0 text-left sm:col-span-7"
                                onClick={() => onOpenImage(5)}
                                aria-label="Open photo 6"
                            >
                                <img
                                    src={l5.src}
                                    alt={l5.alt}
                                    loading="lazy"
                                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 cursor-zoom-in"
                                />
                                <div className="pointer-events-none absolute inset-0 bg-ink/15 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                <div className="pointer-events-none absolute bottom-4 right-4 inline-flex items-center gap-2 bg-white/95 px-3 py-1 text-xs font-medium text-ink shadow-sm opacity-0 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                                    <Eye className="size-4 text-rose" />
                                    <span>Expand</span>
                                </div>
                            </button>
                        )}

                        {p3 && (
                            <button
                                type="button"
                                className="reveal group relative block h-[380px] sm:h-[460px] lg:h-[540px] w-full cursor-pointer overflow-hidden p-0 text-left sm:col-span-5"
                                onClick={() => onOpenImage(3)}
                                aria-label="Open photo 4"
                            >
                                <img
                                    src={p3.src}
                                    alt={p3.alt}
                                    loading="lazy"
                                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 cursor-zoom-in"
                                />
                                <div className="pointer-events-none absolute inset-0 bg-ink/15 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                <div className="pointer-events-none absolute bottom-4 right-4 inline-flex items-center gap-2 bg-white/95 px-3 py-1 text-xs font-medium text-ink shadow-sm opacity-0 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                                    <Eye className="size-4 text-rose" />
                                    <span>Expand</span>
                                </div>
                            </button>
                        )}
                    </div>
                </div>

                {/* View All Photos Action */}
                <div className="mt-12 flex justify-center">
                    <button
                        type="button"
                        onClick={() => onOpenImage(0)}
                        className="reveal group inline-flex cursor-pointer items-center justify-center gap-3 border border-ink/20 bg-white px-8 py-3 text-control font-medium text-ink shadow-xs transition duration-300 hover:border-ink hover:bg-cream/40 hover:text-ink hover:shadow-sm"
                    >
                        <Images className="size-4 text-taupe group-hover:text-ink transition-colors duration-300" />
                        <span>View gallery</span>
                    </button>
                </div>
            </div>
        </section>
    );
}
