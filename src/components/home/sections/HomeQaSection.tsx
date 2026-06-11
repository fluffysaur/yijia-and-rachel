import { Heart } from "lucide-react";
import { siteContent } from "../../../content/wedding";

export function HomeQaSection() {
    return (
        <section
            id="qa"
            className="bg-blush/15 py-20"
        >
            <div className="section-shell">
                <div className="reveal mb-10 max-w-2xl">
                    <p className="text-label uppercase text-rose">For fun</p>
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
                                size={24}
                            />
                            <h3 className="text-lg font-medium">{item.question}</h3>
                            <p className="mt-3 text-taupe">{item.answer}</p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
