import type { ReactNode } from "react";
import { siteContent } from "../content/wedding";
import { Header } from "./Header";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-ink">
      <Header />
      {children}
      <footer className="border-t border-taupe/10 bg-white py-10">
        <div className="section-shell flex flex-col gap-3 text-sm text-taupe md:flex-row md:items-center md:justify-between">
          <p className="font-display text-2xl text-ink">{siteContent.couple.names}</p>
          <p>{siteContent.couple.dateLabel} · {siteContent.couple.locationLabel}</p>
          <a className="hover:text-ink" href={`mailto:${siteContent.contact.email}`}>
            {siteContent.contact.email}
          </a>
        </div>
      </footer>
    </div>
  );
}
