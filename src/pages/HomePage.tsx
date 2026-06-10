import { ArrowRight, ChevronDown, Heart, Mail, Phone } from "lucide-react";
import { useState } from "react";
import { EventCard } from "../components/EventCard";
import { GalleryModal } from "../components/GalleryModal";
import { Layout } from "../components/Layout";
import { Button, LinkButton } from "../components/Button";
import { useRsvpModal } from "../components/RsvpModalContext";
import { siteContent } from "../content/wedding";

export function HomePage() {
    const { openRsvp } = useRsvpModal();
    const galleryImages = [...siteContent.gallery, ...siteContent.highlights];
    const [activeGalleryIndex, setActiveGalleryIndex] = useState<number | null>(null);
    const [openFaqItems, setOpenFaqItems] = useState<Set<string>>(new Set());

    const toggleFaq = (question: string) => {
        setOpenFaqItems((current) => {
            const next = new Set(current);
            if (next.has(question)) {
                next.delete(question);
            } else {
                next.add(question);
            }
            return next;
        });
    };

    return (
        <Layout>
            <main className="bg-white">
                <section className="relative min-h-[82vh] overflow-hidden bg-white">
                    <img
                        src={siteContent.hero.image}
                        alt={siteContent.hero.imageAlt}
                        className="float-slow absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-r from-white/95 via-white/72 to-white/18" />
                    <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-white to-transparent" />
                    <div className="section-shell relative flex min-h-[82vh] items-center pb-16 pt-32 md:pt-36">
                        <div className="max-w-2xl">
                            <p className="reveal text-sm uppercase tracking-[0.28em] text-rose">
                                {siteContent.hero.eyebrow}
                            </p>
                            <h1 className="reveal reveal-delay-1 mt-5 font-display text-7xl leading-none text-ink md:text-9xl">
                                {siteContent.hero.headline}
                            </h1>
                            <p className="reveal reveal-delay-2 mt-5 text-base font-medium uppercase tracking-[0.22em] text-gold">
                                {siteContent.couple.dateLabel} · {siteContent.couple.locationLabel}
                            </p>
                            <p className="reveal reveal-delay-2 mt-6 max-w-xl text-lg leading-8 text-taupe">
                                {siteContent.hero.body}
                            </p>
                            <div className="reveal reveal-delay-3 mt-8 flex flex-wrap gap-3">
                                <Button onClick={openRsvp}>
                                    RSVP now
                                    <ArrowRight size={16} />
                                </Button>
                                <LinkButton
                                    href="#events"
                                    variant="secondary"
                                >
                                    View details
                                </LinkButton>
                            </div>
                        </div>
                    </div>
                </section>

                <section
                    id="story"
                    className="bg-white py-20"
                >
                    <div className="section-shell grid gap-10 md:grid-cols-[0.8fr_1.2fr] md:items-start">
                        <div className="reveal">
                            <p className="text-sm uppercase text-rose">A little background</p>
                            <h2 className="mt-2 font-display text-5xl">{siteContent.story.title}</h2>
                        </div>
                        <div className="reveal reveal-delay-1 space-y-5 text-lg leading-8 text-taupe">
                            {siteContent.story.paragraphs.map((paragraph) => (
                                <p key={paragraph}>{paragraph}</p>
                            ))}
                        </div>
                    </div>
                </section>

                <section
                    id="events"
                    className="bg-cream/35 py-20"
                >
                    <div className="section-shell">
                        <div className="reveal mb-10 max-w-2xl">
                            <p className="text-sm uppercase text-rose">The day</p>
                            <h2 className="mt-2 font-display text-5xl">Wedding Details</h2>
                            <p className="mt-4 text-taupe">
                                Church ceremony and lunch RSVP is open to all invited attendees. Dinner banquet RSVP
                                appears only for invite groups invited to dinner.
                            </p>
                        </div>
                        <div className="grid gap-8">
                            {siteContent.events.map((event) => (
                                <EventCard
                                    key={event.id}
                                    event={event}
                                />
                            ))}
                        </div>
                    </div>
                </section>

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
                            <p className="max-w-md text-taupe">
                                Replace these placeholders with PWS and highlight photos.
                            </p>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {siteContent.gallery.map((image, index) => (
                                <button
                                    key={image.src}
                                    className="reveal group cursor-pointer overflow-hidden rounded-lg shadow-sm"
                                    onClick={() => setActiveGalleryIndex(index)}
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
                                    onClick={() => setActiveGalleryIndex(siteContent.gallery.length + index)}
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

                <section
                    id="qa"
                    className="bg-blush/15 py-20"
                >
                    <div className="section-shell">
                        <div className="reveal mb-10 max-w-2xl">
                            <p className="text-sm uppercase text-rose">For fun</p>
                            <h2 className="mt-2 font-display text-5xl">Q&A</h2>
                        </div>
                        <div className="grid gap-4 md:grid-cols-3">
                            {siteContent.qa.map((item) => (
                                <article
                                    key={item.question}
                                    className="reveal rounded-lg bg-white p-6 shadow-sm"
                                >
                                    <Heart
                                        className="mb-5 text-rose"
                                        size={22}
                                    />
                                    <h3 className="text-lg font-medium">{item.question}</h3>
                                    <p className="mt-3 text-taupe">{item.answer}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section
                    id="faq"
                    className="bg-white py-20"
                >
                    <div className="section-shell grid gap-10 md:grid-cols-[0.8fr_1.2fr]">
                        <div className="reveal">
                            <p className="text-sm uppercase text-rose">Questions</p>
                            <h2 className="mt-2 font-display text-5xl">FAQ</h2>
                        </div>
                        <div className="reveal reveal-delay-1 divide-y divide-taupe/15 rounded-lg border border-taupe/15 bg-white">
                            {siteContent.faq.map((item) => {
                                const isOpen = openFaqItems.has(item.question);

                                return (
                                    <div
                                        key={item.question}
                                        className="p-5"
                                    >
                                        <button
                                            className="flex w-full cursor-pointer items-center justify-between gap-4 text-left text-lg font-medium"
                                            type="button"
                                            aria-expanded={isOpen}
                                            onClick={() => toggleFaq(item.question)}
                                        >
                                            <span>{item.question}</span>
                                            <ChevronDown
                                                className={`shrink-0 text-rose transition duration-300 ${isOpen ? "rotate-180" : ""}`}
                                                size={20}
                                                aria-hidden="true"
                                            />
                                        </button>
                                        <div
                                            className={`grid transition-[grid-template-rows] duration-500 ease-out ${
                                                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                                            }`}
                                        >
                                            <div className="overflow-hidden">
                                                <p className="pt-3 text-taupe">{item.answer}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <section className="bg-cream/35 py-20">
                    <div className="section-shell grid gap-6 rounded-lg bg-white p-8 shadow-sm md:grid-cols-[1fr_auto] md:items-center">
                        <div>
                            <p className="text-sm uppercase text-rose">Reply</p>
                            <h2 className="mt-2 font-display text-5xl">Ready to RSVP?</h2>
                            <p className="mt-4 text-taupe">Search your invite group by name and submit your details.</p>
                        </div>
                        <Button onClick={openRsvp}>
                            Open RSVP
                            <ArrowRight size={16} />
                        </Button>
                    </div>
                </section>

                <section
                    id="contact"
                    className="bg-white py-20"
                >
                    <div className="section-shell reveal max-w-3xl text-center">
                        <p className="text-sm uppercase text-rose">Need help?</p>
                        <h2 className="mt-2 font-display text-5xl">{siteContent.contact.title}</h2>
                        <p className="mt-4 text-taupe">{siteContent.contact.body}</p>
                        <div className="mt-6 flex flex-wrap justify-center gap-3">
                            <LinkButton
                                href={`mailto:${siteContent.contact.email}`}
                                variant="secondary"
                            >
                                <Mail size={16} />
                                {siteContent.contact.email}
                            </LinkButton>
                            <LinkButton
                                href={`tel:${siteContent.contact.phone.replace(/\s/g, "")}`}
                                variant="secondary"
                            >
                                <Phone size={16} />
                                {siteContent.contact.phone}
                            </LinkButton>
                        </div>
                    </div>
                </section>
                {activeGalleryIndex !== null ? (
                    <GalleryModal
                        images={galleryImages}
                        activeIndex={activeGalleryIndex}
                        onChange={setActiveGalleryIndex}
                        onClose={() => setActiveGalleryIndex(null)}
                    />
                ) : null}
            </main>
        </Layout>
    );
}
