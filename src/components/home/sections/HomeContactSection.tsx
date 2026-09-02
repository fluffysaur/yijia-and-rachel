import { siteContent } from "../../../content/wedding";

export function HomeContactSection() {
    return (
        <section
            id="contact"
            className="bg-white py-20"
        >
            <div className="section-shell reveal max-w-3xl text-center">
                <p className="text-label uppercase tracking-[0.24em] text-rose font-medium">Need help?</p>
                <h2 className="mt-2 font-display text-5xl md:text-6xl text-ink">{siteContent.contact.title}</h2>
                <p className="mt-4 text-ink/80 leading-relaxed text-base">{siteContent.contact.body}</p>
            </div>
        </section>
    );
}
