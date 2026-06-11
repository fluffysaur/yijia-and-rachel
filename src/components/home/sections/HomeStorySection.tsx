import { siteContent } from "../../../content/wedding";

export function HomeStorySection() {
    return (
        <section
            id="story"
            className="bg-white py-20"
        >
            <div className="section-shell grid gap-10 md:grid-cols-[0.8fr_1.2fr] md:items-start">
                <div className="reveal">
                    <img
                        className="w-full rounded-lg object-cover"
                        src={siteContent.story.image}
                        alt={siteContent.story.imageAlt}
                    />
                </div>
                <div className="reveal reveal-delay-1 space-y-5 text-lg leading-8 text-taupe">
                    <p className="text-sm uppercase text-rose">A little background</p>
                    <h2 className="mt-2 font-display text-5xl">{siteContent.story.title}</h2>
                    {siteContent.story.paragraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                    ))}
                </div>
            </div>
        </section>
    );
}
