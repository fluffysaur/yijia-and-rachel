import { ArrowRight } from "lucide-react";
import { Button } from "../../Button";

export function HomeRsvpCtaSection({ onOpenRsvp }: { onOpenRsvp: () => void }) {
    return (
        <section className="bg-cream/35 py-20">
            <div className="section-shell grid gap-6 rounded-lg bg-white p-8 shadow-sm md:grid-cols-[1fr_auto] md:items-center">
                <div>
                    <p className="text-label uppercase text-rose">Reply</p>
                    <h2 className="mt-2 font-display text-5xl">Ready to RSVP?</h2>
                    <p className="mt-4 text-taupe">Search your invite group by name and submit your details.</p>
                </div>
                <Button onClick={onOpenRsvp}>
                    Open RSVP
                    <ArrowRight size={16} />
                </Button>
            </div>
        </section>
    );
}
