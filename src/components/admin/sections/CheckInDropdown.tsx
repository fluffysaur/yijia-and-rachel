import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export function CheckInDropdown({
    label,
    attendeeNames,
    checkedNames,
    onToggle,
}: {
    label: string;
    attendeeNames: string[];
    checkedNames: string[];
    onToggle: (name: string) => void;
}) {
    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const [open, setOpen] = useState(false);
    const [position, setPosition] = useState({ left: 0, top: 0, width: 208 });

    const updatePosition = () => {
        const rect = triggerRef.current?.getBoundingClientRect();
        if (!rect) return;

        setPosition({
            left: rect.left,
            top: rect.bottom + 8,
            width: Math.max(rect.width, 208),
        });
    };

    const toggleOpen = () => {
        updatePosition();
        setOpen((value) => !value);
    };

    useEffect(() => {
        if (!open) return;

        const handlePointerDown = (event: MouseEvent) => {
            const target = event.target as Node;
            if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) {
                return;
            }
            setOpen(false);
        };
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setOpen(false);
        };
        const handleReposition = () => updatePosition();

        document.addEventListener("mousedown", handlePointerDown);
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("scroll", handleReposition, true);
        window.addEventListener("resize", handleReposition);

        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("scroll", handleReposition, true);
            window.removeEventListener("resize", handleReposition);
        };
    }, [open]);

    if (!attendeeNames.length) return null;

    return (
        <>
            <button
                ref={triggerRef}
                className="flex min-w-32 cursor-pointer items-center justify-between gap-2 rounded-md border border-taupe/20 bg-white px-2.5 py-2 transition hover:bg-cream"
                type="button"
                aria-expanded={open}
                onClick={toggleOpen}
            >
                <span className="text-sm font-medium">
                    {label} {checkedNames.length}/{attendeeNames.length}
                </span>
                <ChevronDown
                    className={`text-taupe transition ${open ? "rotate-180" : ""}`}
                    size={16}
                />
            </button>
            {open
                ? createPortal(
                      <div
                          ref={menuRef}
                          className="fixed z-100 rounded-md border border-taupe/15 bg-white p-2 shadow-lg"
                          style={{
                              left: position.left,
                              top: position.top,
                              width: position.width,
                          }}
                      >
                          {attendeeNames.map((name) => {
                              const checked = checkedNames.includes(name);

                              return (
                                  <button
                                      key={name}
                                      className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm transition hover:bg-cream"
                                      onClick={() => onToggle(name)}
                                      type="button"
                                  >
                                      <span>{name}</span>
                                      {checked ? (
                                          <Check
                                              className="text-sage"
                                              size={16}
                                          />
                                      ) : null}
                                  </button>
                              );
                          })}
                      </div>,
                      document.body,
                  )
                : null}
        </>
    );
}
