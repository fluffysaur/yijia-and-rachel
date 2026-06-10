import { Mail, Phone } from "lucide-react";
import { LinkButton } from "../../Button";
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
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <LinkButton
                        href={`mailto:${siteContent.contact.email}`}
                        variant="secondary"
                    >
                        <Mail size={16} />
                        {siteContent.contact.email}
                    </LinkButton>
                    <LinkButton
                        href={`tel:${siteContent.contact.phone.replace(/\s/g, "")}`}
                        variant="secondary"
                    >
                        <Phone size={16} />
                        {siteContent.contact.phone}
                    </LinkButton>
                </div>
            </div>
        </section>
    );
}
