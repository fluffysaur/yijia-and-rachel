import { siteContent } from "../../../content/wedding";

export function HomeStorySection() {
    return (
        <section
            id="story"
            className="bg-white py-20"
        >
            <div className="section-shell grid gap-10 md:grid-cols-[0.8fr_1.2fr] md:items-start">
                <div className="reveal">
                    <div className="border border-taupe/20 bg-cream/20 p-2 shadow-xs">
                        <img
                            className="w-full object-cover"
                            src={siteContent.story.image}
                            alt={siteContent.story.imageAlt}
                        />
                    </div>
                </div>
                <div className="reveal reveal-delay-1 space-y-4 text-base leading-relaxed text-ink/80">
                    <p className="text-label uppercase tracking-[0.24em] text-rose font-medium">A little background</p>
                    <h2 className="mt-2 font-display text-5xl md:text-6xl text-ink">{siteContent.story.title}</h2>
                    {siteContent.story.paragraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                    ))}
                </div>
            </div>
        </section>
    );
}
