import { siteContent } from "../../../content/wedding";

const numerals = ["I", "II", "III", "IV", "V"];

export function HomeQaSection() {
    return (
        <section
            id="qa"
            className="bg-cream/40 py-20 border-y border-taupe/10"
        >
            <div className="section-shell">
                <div className="reveal mb-12 text-center max-w-xl mx-auto">
                    <p className="text-label uppercase tracking-[0.24em] text-rose font-medium">In Conversation</p>
                    <h2 className="mt-2 font-display text-5xl md:text-6xl text-ink">Q&A</h2>
                    <p className="mt-3 font-serif italic text-base text-ink/75">A few quiet truths & stories along the way</p>
                </div>

                <div className="reveal reveal-delay-1 border border-taupe/15 bg-white/90 shadow-xs">
                    <div className="grid divide-y divide-taupe/15 md:grid-cols-3 md:divide-y-0 md:divide-x md:divide-taupe/15">
                        {siteContent.qa.map((item, index) => (
                            <article
                                key={item.question}
                                className="p-8 md:p-10 flex flex-col justify-between transition-colors duration-300 hover:bg-cream/20"
                            >
                                <div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-serif text-sm tracking-[0.2em] text-gold uppercase">
                                            {numerals[index] ?? `0${index + 1}`}
                                        </span>
                                        <span className="h-px w-6 bg-gold/40" />
                                    </div>
                                    <h3 className="mt-6 font-serif italic text-2xl text-ink leading-snug">
                                        "{item.question}"
                                    </h3>
                                </div>
                                <div className="mt-6 pt-6 border-t border-taupe/10">
                                    <p className="text-ink/80 leading-relaxed text-base">
                                        {item.answer}
                                    </p>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
