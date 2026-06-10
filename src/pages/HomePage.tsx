import { useEffect, useState } from "react";
import { GalleryModal } from "../components/GalleryModal";
import {
    HomeContactSection,
    HomeEventsSection,
    HomeFaqSection,
    HomeGallerySection,
    HomeHeroSection,
    HomeQaSection,
    HomeRsvpCtaSection,
    HomeStorySection,
} from "../components/home";
import { Layout } from "../components/Layout";
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

    useEffect(() => {
        const revealElements = Array.from(document.querySelectorAll<HTMLElement>(".reveal, .hero-background-fade"));

        if (!revealElements.length) {
            return;
        }

        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        if (prefersReducedMotion || !("IntersectionObserver" in window)) {
            revealElements.forEach((element) => element.classList.add("reveal-visible"));
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) {
                        return;
                    }

                    entry.target.classList.add("reveal-visible");
                    observer.unobserve(entry.target);
                });
            },
            {
                rootMargin: "0px 0px -12% 0px",
                threshold: 0.1,
            },
        );

        revealElements.forEach((element) => observer.observe(element));

        return () => observer.disconnect();
    }, []);

    return (
        <Layout>
            <main className="bg-white">
                <HomeHeroSection onOpenRsvp={openRsvp} />
                <HomeStorySection />
                <HomeEventsSection />
                <HomeGallerySection onOpenImage={setActiveGalleryIndex} />
                <HomeQaSection />
                <HomeFaqSection
                    openFaqItems={openFaqItems}
                    onToggleFaq={toggleFaq}
                />
                <HomeRsvpCtaSection onOpenRsvp={openRsvp} />
                <HomeContactSection />

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
