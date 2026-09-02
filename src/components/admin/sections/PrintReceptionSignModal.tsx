import { useEffect, useRef, useState } from "react";
import { Printer, X } from "lucide-react";
import QRCode from "qrcode";
import { Button } from "../../Button";

export function PrintReceptionSignModal({
  open,
  onClose,
  checkInUrl,
  activeEvent,
}: {
  open: boolean;
  onClose: () => void;
  checkInUrl: string;
  activeEvent: "ceremony" | "dinner";
}) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const printContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    let active = true;
    QRCode.toDataURL(checkInUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: "#2c2926",
        light: "#ffffff",
      },
    })
      .then((url) => {
        if (active) setQrDataUrl(url);
      })
      .catch((error) => {
        console.error("Failed to generate QR code data URL", error);
      });

    return () => {
      active = false;
    };
  }, [open, checkInUrl]);

  if (!open) return null;

  const eventLabel = activeEvent === "dinner" ? "Dinner" : "Church";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="print-sign-title"
    >
      <div className="relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-xs border border-taupe/20 bg-cream shadow-xl">
        {/* Modal Toolbar (hidden on print) */}
        <div className="print:hidden flex items-center justify-between border-b border-taupe/15 bg-white px-6 py-4">
          <div>
            <h2 id="print-sign-title" className="font-display text-xl font-medium tracking-wide text-ink">
              Reception Sign Preview
            </h2>
            <p className="text-xs uppercase tracking-[0.16em] text-taupe">
              Print-ready wedding stationery display
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              className="flex min-h-11 items-center gap-2 px-4 text-xs font-semibold uppercase tracking-[0.16em]"
              variant="primary"
              onClick={handlePrint}
            >
              <Printer size={16} />
              Print
            </Button>
            <button
              type="button"
              className="flex size-11 items-center justify-center rounded-xs text-ink/60 transition hover:bg-taupe/10 hover:text-ink"
              onClick={onClose}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Sign Content */}
        <div className="overflow-y-auto p-6">
          <div
            ref={printContainerRef}
            className="relative mx-auto flex max-w-md flex-col items-center justify-center border border-taupe/30 bg-white p-8 text-center shadow-xs before:pointer-events-none before:absolute before:inset-3 before:border before:border-taupe/15"
          >
            <span className="font-display text-xs uppercase tracking-[0.28em] text-taupe">
              Welcome to the Wedding of
            </span>

            <h1 className="mt-2 font-script text-5xl text-ink leading-tight sm:text-6xl">
              Yi Jia &amp; Rachel
            </h1>

            <div className="my-3 flex items-center gap-2">
              <span className="h-px w-8 bg-taupe/20" />
              <span className="font-display text-xs uppercase tracking-[0.2em] text-taupe">
                {eventLabel} Check-In
              </span>
              <span className="h-px w-8 bg-taupe/20" />
            </div>

            <div className="relative my-4 rounded-xs border border-taupe/20 bg-ivory/40 p-3 shadow-xs">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Wedding Check-in QR Code"
                  className="size-48 object-contain"
                />
              ) : (
                <div className="flex size-48 items-center justify-center text-xs text-taupe">
                  Generating QR...
                </div>
              )}
            </div>

            <p className="mt-2 font-display text-xl text-ink">
              Scan to Self-Check-In
            </p>

            <p className="mt-1 max-w-xs text-base text-ink/80 leading-relaxed">
              Open your mobile camera to scan, then enter your invitation password to confirm your group&apos;s arrival.
            </p>

            <div className="mt-6 border-t border-taupe/15 pt-3 text-xs">
              <span className="tracking-wider uppercase text-taupe/80">URL: </span>
              <span className="font-mono text-ink/75 lowercase">{checkInUrl}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
