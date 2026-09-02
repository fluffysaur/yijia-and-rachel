import { useEffect, useRef, useState } from "react";
import { Check, Copy, Download, ExternalLink, Printer } from "lucide-react";
import QRCode from "qrcode";
import { Button } from "../../Button";
import { PrintReceptionSignModal } from "./PrintReceptionSignModal";
import type { CheckInEventType } from "../../../types/rsvp";

export function AdminCheckInQrCard({
  activeEvent,
  onEventChange,
  savingEvent,
}: {
  activeEvent: CheckInEventType;
  onEventChange: (event: CheckInEventType) => Promise<void>;
  savingEvent: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const checkInUrl = typeof window !== "undefined"
    ? `${window.location.origin}/check-in`
    : "/check-in";

  useEffect(() => {
    let active = true;

    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        checkInUrl,
        {
          width: 176,
          margin: 1,
          color: {
            dark: "#2c2926",
            light: "#ffffff",
          },
        },
        (error) => {
          if (error) console.error("Error drawing QR code to canvas", error);
        }
      );
    }

    QRCode.toDataURL(checkInUrl, {
      width: 512,
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
        console.error("Error generating QR data URL", error);
      });

    return () => {
      active = false;
    };
  }, [checkInUrl]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(checkInUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = checkInUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const downloadLink = document.createElement("a");
    downloadLink.href = qrDataUrl;
    downloadLink.download = `wedding-check-in-qr-${activeEvent}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <>
      <section
        id="check-in-station"
        className="scroll-mt-24 rounded-xs border border-taupe/15 bg-white/95 p-6 shadow-xs"
      >
        <div>
          <h2 className="font-display text-3xl text-ink">
            Reception Check-In Station
          </h2>
          <p className="mt-1 max-w-2xl text-base text-ink/80 leading-relaxed">
            Display or print this QR code at the wedding reception table. Attendees can scan to check in their party at <span className="font-mono text-xs text-taupe">/check-in</span> using their invite password.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            {/* QR Code Canvas Frame */}
            <div className="flex size-44 shrink-0 items-center justify-center rounded-xs border border-taupe/20 bg-white p-2 shadow-xs">
              <canvas ref={canvasRef} className="size-40" />
            </div>

            {/* Active Event Toggle */}
            <div className="space-y-2">
              <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-taupe">
                Active Event for Arriving Guests
              </span>
              <div className="inline-flex rounded-xs border border-taupe/20 bg-taupe/10 p-1">
                <button
                  type="button"
                  disabled={savingEvent}
                  onClick={() => void onEventChange("ceremony")}
                  className={`inline-flex min-h-10 cursor-pointer items-center justify-center rounded-xs px-6 text-xs font-semibold uppercase tracking-[0.16em] transition ${
                    activeEvent === "ceremony"
                      ? "bg-white text-ink shadow-xs"
                      : "text-ink/75 hover:text-ink"
                  }`}
                >
                  Church
                </button>
                <button
                  type="button"
                  disabled={savingEvent}
                  onClick={() => void onEventChange("dinner")}
                  className={`inline-flex min-h-10 cursor-pointer items-center justify-center rounded-xs px-6 text-xs font-semibold uppercase tracking-[0.16em] transition ${
                    activeEvent === "dinner"
                      ? "bg-white text-ink shadow-xs"
                      : "text-ink/75 hover:text-ink"
                  }`}
                >
                  Dinner
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 border-t border-taupe/15 pt-4 lg:border-t-0 lg:pt-0">
            <Button
              className="flex min-h-11 items-center gap-2 px-4 text-xs font-semibold uppercase tracking-[0.16em]"
              variant="secondary"
              onClick={handleCopyLink}
            >
              {copied ? <Check size={16} className="text-sage" /> : <Copy size={16} />}
              {copied ? "Copied" : "Copy Link"}
            </Button>

            <Button
              className="flex min-h-11 items-center gap-2 px-4 text-xs font-semibold uppercase tracking-[0.16em]"
              variant="secondary"
              onClick={handleDownloadQr}
            >
              <Download size={16} />
              Download QR
            </Button>

            <Button
              className="flex min-h-11 items-center gap-2 px-4 text-xs font-semibold uppercase tracking-[0.16em]"
              variant="secondary"
              onClick={() => setPrintModalOpen(true)}
            >
              <Printer size={16} />
              Print
            </Button>

            <Button
              className="flex min-h-11 items-center gap-2 px-4 text-xs font-semibold uppercase tracking-[0.16em]"
              variant="secondary"
              onClick={() => window.open("/check-in", "_blank", "noopener,noreferrer")}
            >
              <ExternalLink size={16} />
              Open Link
            </Button>
          </div>
        </div>
      </section>

      <PrintReceptionSignModal
        open={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        checkInUrl={checkInUrl}
        activeEvent={activeEvent}
      />
    </>
  );
}
