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
                                        <p className="pt-3 text-taupe">{item.answer}</p>
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
