import { ArrowRight } from "lucide-react";
import { Button } from "../../Button";

export function HomeRsvpCtaSection({ onOpenRsvp }: { onOpenRsvp: () => void }) {
    return (
        <section className="bg-cream/35 py-20 border-t border-taupe/10">
            <div className="section-shell">
                <div className="relative border border-taupe/20 bg-white p-8 md:p-12 shadow-xs before:pointer-events-none before:absolute before:inset-2 before:border before:border-taupe/10 grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
                    <div>
                        <p className="text-label uppercase tracking-[0.24em] text-rose font-medium">Kind Response</p>
                        <h2 className="mt-2 font-display text-4xl md:text-5xl text-ink">Ready to RSVP?</h2>
                        <p className="mt-3 text-ink/80 leading-relaxed text-base">Search your invite group by name and submit your details to join our celebration.</p>
                    </div>
                    <Button onClick={onOpenRsvp}>
                        Open RSVP
                        <ArrowRight size={16} />
                    </Button>
                </div>
            </div>
        </section>
    );
}
