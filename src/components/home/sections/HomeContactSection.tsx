import { siteContent } from "../../../content/wedding";

export function HomeContactSection() {
    return (
        <section
            id="contact"
            className="bg-white py-20"
        >
            <div className="section-shell reveal max-w-3xl text-center">
                <p className="text-sm uppercase text-rose">Need help?</p>
                <h2 className="mt-2 font-display text-5xl">{siteContent.contact.title}</h2>
                <p className="mt-4 text-taupe">{siteContent.contact.body}</p>
            </div>
        </section>
    );
}
