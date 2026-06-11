import { LogOut, Menu, X } from "lucide-react";
import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { Link, useLocation } from "react-router";
import { clsx } from "clsx";
import { siteContent } from "../content/wedding";
import { Button } from "./Button";
import { useRsvpModal } from "./RsvpModalContext";
import { useAuth } from "./auth/AuthContext";

const clamp = (value: number) => Math.min(1, Math.max(0, value));

export function Header() {
    const location = useLocation();
    const { openRsvp } = useRsvpModal();
    const { session, signOut } = useAuth();
    const isAdmin = location.pathname === "/admin";
    const [menuOpen, setMenuOpen] = useState(false);
    const [observedSection, setObservedSection] = useState("");
    const [backgroundProgress, setBackgroundProgress] = useState(0);

    const navItems = useMemo(() => {
        const items = isAdmin
            ? [
                  { href: "#summary", label: "Summary" },
                  { href: "#rsvp-settings", label: "Deadline" },
                  { href: "#settings", label: "Passwords" },
                  { href: "#invite-message-settings", label: "Templates" },
                  { href: "#invites", label: "Invites" },
              ]
            : siteContent.navigation;

        return items.map((item) => ({
            ...item,
            sectionId: item.href.replace("#", ""),
        }));
    }, [isAdmin]);

    useEffect(() => {
        const updateHeaderState = () => {
            setBackgroundProgress(location.pathname === "/" ? clamp(window.scrollY / 96) : 1);

            const probeY = window.scrollY + Math.min(window.innerHeight * 0.42, 360);
            const active = navItems.reduce<string>((current, item) => {
                const section = document.getElementById(item.sectionId);
                if (!section) return current;
                return section.offsetTop <= probeY ? item.sectionId : current;
            }, "");

            setObservedSection(active);
        };

        updateHeaderState();
        window.addEventListener("scroll", updateHeaderState, { passive: true });
        window.addEventListener("resize", updateHeaderState);

        return () => {
            window.removeEventListener("scroll", updateHeaderState);
            window.removeEventListener("resize", updateHeaderState);
        };
    }, [location.pathname, navItems]);

    const navHref = (href: string) => (location.pathname === "/" || isAdmin ? href : `/${href}`);
    const activeSection = location.pathname === "/" || isAdmin ? observedSection : "";
    const navLinkClass = (sectionId: string) =>
        clsx(
            "underline-offset-8 decoration-rose/70 transition hover:text-ink hover:underline",
            activeSection === sectionId ? "font-semibold text-ink underline" : "font-medium text-taupe",
        );
    const handleSectionClick = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
        if (location.pathname !== "/" && !isAdmin) {
            return;
        }

        const section = document.getElementById(href.replace("#", ""));
        if (!section) {
            return;
        }

        event.preventDefault();
        setMenuOpen(false);
        const headerOffset = isAdmin ? 80 : 0;
        window.scrollTo({ top: Math.max(0, section.offsetTop - headerOffset), behavior: "smooth" });
    };
    const handleBrandClick = (event: MouseEvent<HTMLAnchorElement>) => {
        if (location.pathname !== "/" && !isAdmin) {
            return;
        }

        event.preventDefault();
        setMenuOpen(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <header
            className="fixed inset-x-0 top-0 z-40 border-b"
            style={{
                backgroundColor: `rgba(255, 255, 255, ${backgroundProgress})`,
                borderColor: `rgba(118, 107, 98, ${backgroundProgress * 0.12})`,
            }}
        >
            <div className="section-shell flex min-h-16 items-center justify-between gap-4">
                <Link
                    to={isAdmin ? "/admin" : "/"}
                    className="font-display text-3xl text-ink"
                    onClick={handleBrandClick}
                >
                    {isAdmin ? "Yi Jia & Rachel Admin" : siteContent.couple.names}
                </Link>
                <nav className="hidden flex-1 flex-wrap items-center justify-start gap-x-5 gap-y-2 text-small lg:flex ml-8">
                    {navItems.map((item) => (
                        <a
                            key={item.href}
                            href={navHref(item.href)}
                            className={navLinkClass(item.sectionId)}
                            onClick={(event) => handleSectionClick(event, item.href)}
                        >
                            {item.label}
                        </a>
                    ))}
                </nav>
                <div className="flex items-center gap-2">
                    {!isAdmin ? (
                        <Button
                            className="hidden sm:inline-flex"
                            onClick={openRsvp}
                        >
                            RSVP
                        </Button>
                    ) : null}
                    {session ? (
                        <button
                            className="hidden size-10 cursor-pointer items-center justify-center rounded-md border border-taupe/20 bg-white/85 text-taupe transition duration-300 hover:border-rose/40 hover:bg-cream hover:text-ink lg:inline-flex"
                            aria-label="Sign out"
                            onClick={signOut}
                        >
                            <LogOut size={16} />
                        </button>
                    ) : null}
                    <button
                        className="relative inline-flex size-10 cursor-pointer items-center justify-center rounded-md border border-taupe/20 bg-white/85 text-ink transition duration-300 hover:border-rose/40 hover:bg-cream lg:hidden"
                        aria-label={menuOpen ? "Close navigation" : "Open navigation"}
                        aria-expanded={menuOpen}
                        onClick={() => setMenuOpen((value) => !value)}
                    >
                        <Menu
                            size={20}
                            className={clsx(
                                "absolute transition-all duration-300",
                                menuOpen ? "rotate-90 scale-75 opacity-0" : "rotate-0 scale-100 opacity-100",
                            )}
                        />
                        <X
                            size={20}
                            className={clsx(
                                "absolute transition-all duration-300",
                                menuOpen ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-75 opacity-0",
                            )}
                        />
                    </button>
                </div>
            </div>
            <div
                className={clsx(
                    "overflow-hidden border-t border-taupe/10 bg-white/95 shadow-sm transition-all duration-500 ease-out lg:hidden",
                    menuOpen ? "max-h-96 opacity-100" : "pointer-events-none max-h-0 opacity-0",
                )}
            >
                <nav className="section-shell grid gap-2 py-4 text-small">
                    {navItems.map((item) => (
                        <a
                            key={item.href}
                            href={navHref(item.href)}
                            className={clsx("rounded-md px-1 py-2", navLinkClass(item.sectionId))}
                            onClick={(event) => handleSectionClick(event, item.href)}
                        >
                            {item.label}
                        </a>
                    ))}
                    {!isAdmin ? (
                        <Button
                            className="mt-2 w-full sm:hidden"
                            onClick={() => {
                                setMenuOpen(false);
                                openRsvp();
                            }}
                        >
                            RSVP
                        </Button>
                    ) : null}
                    {session ? (
                        <button
                            className="mt-2 rounded-md px-1 py-2 text-left font-semibold text-rose transition hover:bg-rose/10 cursor-pointer"
                            type="button"
                            onClick={() => {
                                setMenuOpen(false);
                                signOut();
                            }}
                        >
                            Sign out
                        </button>
                    ) : null}
                </nav>
            </div>
        </header>
    );
}
