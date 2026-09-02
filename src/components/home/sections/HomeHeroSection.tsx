import { ArrowRight } from "lucide-react";
import { Button, LinkButton } from "../../Button";
import { siteContent } from "../../../content/wedding";
import { BotanicalFallingLeaves } from "../../effects/BotanicalFallingLeaves";

export function HomeHeroSection({ onOpenRsvp }: { onOpenRsvp: () => void }) {
    return (
        <section className="relative min-h-[82vh] overflow-hidden bg-white">
            {/* Mobile Hero Image (DSC05999 portrait) */}
            <img
                src={siteContent.hero.mobileImage ?? siteContent.hero.image}
                alt={siteContent.hero.imageAlt}
                className="hero-background-fade float-slow absolute inset-0 h-full w-full object-cover object-[center_20%] md:hidden"
            />
            {/* Desktop Hero Image (DSC06006 landscape, cropped with couple at 2/3rd and elevated) */}
            <img
                src={siteContent.hero.image}
                alt={siteContent.hero.imageAlt}
                className="hero-background-fade float-slow absolute inset-0 hidden h-full w-full object-cover md:block md:object-[center_55%]"
            />
            {/* Responsive overlay: clear top 55% on mobile with soft bottom fade; horizontal fade on desktop */}
            <div className="absolute inset-0 bg-linear-to-b from-transparent via-white/40 via-55% to-white md:bg-linear-to-r md:from-white/85 md:via-white/40 md:to-transparent" />
            {/* Ambient falling leaves & petals confined strictly to hero */}
            <BotanicalFallingLeaves className="pointer-events-none absolute inset-0 z-10 h-full w-full" />
            {/* Top scrim for transparent navbar text contrast */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b from-white/70 via-white/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-white to-transparent" />
            <div className="section-shell relative z-20 flex min-h-[86vh] items-end pb-12 pt-28 sm:pb-14 md:min-h-[82vh] md:items-center md:pb-16 md:pt-36">
                <div className="max-w-2xl">
                    <h1 className="reveal reveal-delay-1 font-script text-7xl leading-tight text-ink drop-shadow-[0_1px_6px_rgba(255,255,255,0.85)] md:text-9xl md:drop-shadow-none">
                        {siteContent.hero.headline}
                    </h1>
                    <p className="reveal reveal-delay-2 mt-4 text-label font-bold uppercase tracking-[0.22em] text-[#7a5618] drop-shadow-[0_1px_4px_rgba(255,255,255,0.85)] md:mt-5 md:font-semibold md:drop-shadow-none">
                        {siteContent.couple.dateLabel} · {siteContent.couple.locationLabel}
                    </p>
                    <div className="reveal reveal-delay-3 mt-7 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                        <Button className="w-full sm:w-auto" onClick={onOpenRsvp}>
                            RSVP now
                            <ArrowRight size={16} />
                        </Button>
                        <LinkButton
                            href="#events"
                            variant="secondary"
                            className="w-full sm:w-auto text-center"
                        >
                            View details
                        </LinkButton>
                    </div>
                </div>
            </div>
        </section>
    );
}
