import { ChevronDown } from "lucide-react";
import { siteContent } from "../../../content/wedding";

export function HomeFaqSection({
    openFaqItems,
    onToggleFaq,
}: {
    openFaqItems: Set<string>;
    onToggleFaq: (question: string) => void;
}) {
    return (
        <section
            id="faq"
            className="bg-white py-20"
        >
            <div className="section-shell grid gap-10 md:grid-cols-[0.8fr_1.2fr]">
                <div className="reveal">
                    <p className="text-label uppercase tracking-[0.24em] text-rose font-medium">Common Inquiries</p>
                    <h2 className="mt-2 font-display text-5xl md:text-6xl text-ink">FAQ</h2>
                </div>
                <div className="reveal reveal-delay-1 divide-y divide-taupe/15 border border-taupe/15 bg-white/90 shadow-xs">
                    {siteContent.faq.map((item) => {
                        const isOpen = openFaqItems.has(item.question);

                        return (
                            <div
                                key={item.question}
                                className="p-6 transition-colors duration-200 hover:bg-cream/20"
                            >
                                <button
                                    className="flex w-full cursor-pointer items-center justify-between gap-4 text-left font-sans text-lg font-semibold text-ink sm:text-xl transition-colors hover:text-rose"
                                    type="button"
                                    aria-expanded={isOpen}
                                    onClick={() => onToggleFaq(item.question)}
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
                                        <p className="pt-4 text-base text-ink/80 leading-relaxed">{item.answer}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
