import { siteContent } from "../../../content/wedding";

export function HomeGallerySection({ onOpenImage }: { onOpenImage: (index: number) => void }) {
    return (
        <section
            id="gallery"
            className="bg-white py-20"
        >
            <div className="section-shell">
                <div className="reveal mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-sm uppercase text-rose">Pre-wedding shoot</p>
                        <h2 className="mt-2 font-display text-5xl">Gallery</h2>
                    </div>
                    <p className="max-w-md text-taupe">Replace these placeholders with PWS and highlight photos.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {siteContent.gallery.map((image, index) => (
                        <button
                            key={image.src}
                            className="reveal group cursor-pointer overflow-hidden rounded-lg shadow-sm"
                            onClick={() => onOpenImage(index)}
                            aria-label={`Open ${image.alt}`}
                        >
                            <img
                                src={image.src}
                                alt={image.alt}
                                className="aspect-4/5 w-full object-cover transition duration-700 ease-out group-hover:scale-105 cursor-zoom-in"
                            />
                        </button>
                    ))}
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {siteContent.highlights.map((image, index) => (
                        <button
                            key={image.src}
                            className="reveal group cursor-pointer overflow-hidden rounded-lg shadow-sm"
                            onClick={() => onOpenImage(siteContent.gallery.length + index)}
                            aria-label={`Open ${image.alt}`}
                        >
                            <img
                                src={image.src}
                                alt={image.alt}
                                className="aspect-video w-full object-cover transition duration-700 ease-out group-hover:scale-105 cursor-zoom-in"
                            />
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}
