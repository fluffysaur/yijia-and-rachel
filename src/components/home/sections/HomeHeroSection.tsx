import { ArrowRight } from "lucide-react";
import { Button, LinkButton } from "../../Button";
import { siteContent } from "../../../content/wedding";

export function HomeHeroSection({ onOpenRsvp }: { onOpenRsvp: () => void }) {
    return (
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
                    <p className="reveal text-sm uppercase tracking-[0.28em] text-rose">{siteContent.hero.eyebrow}</p>
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
                        <Button onClick={onOpenRsvp}>
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
    );
}
