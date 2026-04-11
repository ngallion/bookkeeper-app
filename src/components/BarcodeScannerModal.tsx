import { useEffect, useRef, useState } from "react";
import { X, Camera, CameraOff, RefreshCw, Zap, ZapOff } from "lucide-react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { NotFoundException } from "@zxing/library";
import type { IScannerControls } from "@zxing/browser";
import { lookupByISBN } from "../services/openLibrary";

function beep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.value = 1480; // E6 — bright, scanner-like
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.12);
    osc.onended = () => ctx.close();
  } catch {
    // AudioContext not available — silently skip
  }
}
import { useBookStore } from "../store/bookStore";
import { BookCover } from "./ui/BookCover";
import type { OLSearchResult } from "../types/book";

interface BarcodeScannerModalProps {
  open: boolean;
  onClose: () => void;
}

type ScanState =
  | { status: "scanning" }
  | { status: "loading"; isbn: string }
  | { status: "found"; book: OLSearchResult }
  | { status: "not_found"; isbn: string }
  | { status: "error"; message: string }
  | { status: "no_camera" };

export function BarcodeScannerModal({
  open,
  onClose,
}: BarcodeScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [state, setState] = useState<ScanState>({ status: "scanning" });
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [cameraIndex, setCameraIndex] = useState(0);
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const { addToWishlist, isInWishlist, isRead } = useBookStore();

  const getVideoTrack = (): MediaStreamTrack | null => {
    const stream = videoRef.current?.srcObject;
    if (!(stream instanceof MediaStream)) return null;
    return stream.getVideoTracks()[0] ?? null;
  };

  const stopScanning = () => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    setTorchOn(false);
    setTorchSupported(false);
  };

  const toggleTorch = async () => {
    const track = getVideoTrack();
    if (!track) return;
    const next = !torchOn;
    try {
      await track.applyConstraints({
        advanced: [{ torch: next } as MediaTrackConstraintSet],
      });
      setTorchOn(next);
    } catch {
      // torch not supported on this device/browser
    }
  };

  const startScanning = async (deviceId?: string) => {
    if (!videoRef.current) return;

    stopScanning();

    try {
      const devices = await BrowserMultiFormatReader.listVideoInputDevices();
      if (devices.length === 0) {
        setState({ status: "no_camera" });
        return;
      }
      setCameras(devices);

      // Prefer back camera on mobile
      const targetId =
        deviceId ??
        devices.find((d) => /back|rear|environment/i.test(d.label))?.deviceId ??
        devices[0].deviceId;

      setState({ status: "scanning" });
      setTorchOn(false);
      setTorchSupported(false);

      const reader = new BrowserMultiFormatReader();
      controlsRef.current = await reader.decodeFromVideoDevice(
        targetId,
        videoRef.current,
        async (result, err) => {
          if (result) {
            const text = result.getText();
            // Only handle EAN-13 / ISBN-13 / ISBN-10
            if (!/^\d{10}(\d{3})?$/.test(text.replace(/-/g, ""))) return;

            stopScanning();
            beep();
            setState({ status: "loading", isbn: text });

            try {
              const book = await lookupByISBN(text);
              if (book) {
                setState({ status: "found", book });
              } else {
                setState({ status: "not_found", isbn: text });
              }
            } catch {
              setState({
                status: "error",
                message: "Could not reach Open Library. Check your connection.",
              });
            }
          } else if (err && !(err instanceof NotFoundException)) {
            console.warn("Scanner error:", err);
          }
        },
      );
      // Check torch support once stream is live
      setTimeout(() => {
        const track = getVideoTrack();
        if (track) {
          const caps = track.getCapabilities() as MediaTrackCapabilities & {
            torch?: boolean;
          };
          setTorchSupported(caps.torch === true);
        }
      }, 500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("Permission") || msg.includes("NotAllowed")) {
        setState({
          status: "error",
          message:
            "Camera permission denied. Allow camera access and try again.",
        });
      } else {
        setState({ status: "error", message: "Could not start camera." });
      }
    }
  };

  const switchCamera = () => {
    const next = (cameraIndex + 1) % cameras.length;
    setCameraIndex(next);
    startScanning(cameras[next].deviceId);
  };

  const rescan = () => {
    setState({ status: "scanning" });
    startScanning(cameras[cameraIndex]?.deviceId);
  };

  useEffect(() => {
    if (open) {
      startScanning();
    }
    return () => {
      stopScanning();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleAdd = (book: OLSearchResult) => {
    addToWishlist({
      id: book.key,
      title: book.title,
      author: book.author_name?.[0] ?? "Unknown author",
      coverId: book.cover_i,
      score: 5,
      tags: [],
      firstPublishYear: book.first_publish_year,
      pages: book.number_of_pages_median,
    });
    onClose();
  };

  if (!open) return null;

  const alreadyAdded =
    state.status === "found" &&
    (isInWishlist(state.book.key) || isRead(state.book.key));

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-ink-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-paper-300/10 bg-ink-800">
        <div className="flex items-center gap-2">
          <Camera size={18} className="text-amber-400" />
          <span className="font-semibold text-paper-100">Scan Barcode</span>
        </div>
        <div className="flex items-center gap-2">
          {torchSupported && (
            <button
              onClick={toggleTorch}
              title={torchOn ? "Turn off flash" : "Turn on flash"}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                torchOn
                  ? "bg-amber-400 text-ink-900"
                  : "bg-ink-700 text-paper-300/60 hover:text-paper-100"
              }`}
            >
              {torchOn ? <Zap size={15} /> : <ZapOff size={15} />}
            </button>
          )}
          {cameras.length > 1 && (
            <button
              onClick={switchCamera}
              title="Switch camera"
              className="w-8 h-8 rounded-lg bg-ink-700 text-paper-300/60 hover:text-paper-100 flex items-center justify-center transition-colors"
            >
              <RefreshCw size={15} />
            </button>
          )}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-ink-700 text-paper-300/60 hover:text-paper-100 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Camera viewport */}
      <div className="relative flex-1 bg-black overflow-hidden">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          muted
        />

        {/* Scan overlay — only when actively scanning */}
        {state.status === "scanning" && (
          <>
            {/* Dim surrounding areas */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-72 h-40">
                {/* Corner brackets */}
                {[
                  "top-0 left-0 border-t-2 border-l-2 rounded-tl-lg",
                  "top-0 right-0 border-t-2 border-r-2 rounded-tr-lg",
                  "bottom-0 left-0 border-b-2 border-l-2 rounded-bl-lg",
                  "bottom-0 right-0 border-b-2 border-r-2 rounded-br-lg",
                ].map((cls, i) => (
                  <div
                    key={i}
                    className={`absolute w-8 h-8 border-amber-400 ${cls}`}
                  />
                ))}
                {/* Scan line animation */}
                <div className="absolute inset-x-2 top-0 h-0.5 bg-amber-400/80 animate-scan rounded-full" />
              </div>
            </div>
            <p className="absolute bottom-8 left-0 right-0 text-center text-paper-300/60 text-sm">
              Point the camera at a book's barcode
            </p>
          </>
        )}

        {/* Loading state */}
        {state.status === "loading" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ink-900/70">
            <div className="w-8 h-8 border-2 border-amber-400/40 border-t-amber-400 rounded-full animate-spin" />
            <p className="text-paper-100 text-sm">
              Looking up ISBN {state.isbn}…
            </p>
          </div>
        )}

        {/* No camera */}
        {state.status === "no_camera" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center">
            <CameraOff size={40} className="text-paper-300/30" />
            <p className="text-paper-100 font-medium">No camera found</p>
            <p className="text-paper-300/50 text-sm">
              Connect a camera and try again
            </p>
          </div>
        )}

        {/* Error state */}
        {state.status === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8 text-center">
            <CameraOff size={40} className="text-paper-300/30" />
            <p className="text-paper-100 font-medium">Something went wrong</p>
            <p className="text-paper-300/50 text-sm">{state.message}</p>
            <button
              onClick={rescan}
              className="px-4 py-2 rounded-xl bg-amber-400 text-ink-900 font-semibold text-sm"
            >
              Try again
            </button>
          </div>
        )}

        {/* Not found state */}
        {state.status === "not_found" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8 text-center">
            <p className="text-paper-100 font-medium">Book not found</p>
            <p className="text-paper-300/50 text-sm">
              ISBN {state.isbn} wasn't found in Open Library
            </p>
            <button
              onClick={rescan}
              className="px-4 py-2 rounded-xl bg-amber-400 text-ink-900 font-semibold text-sm"
            >
              Scan another
            </button>
          </div>
        )}
      </div>

      {/* Found — book result card at bottom */}
      {state.status === "found" && (
        <div className="bg-ink-800 border-t border-paper-300/10 px-4 py-4">
          <div className="flex gap-3 items-center mb-4">
            <BookCover
              coverId={state.book.cover_i}
              title={state.book.title}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <p className="text-paper-100 font-semibold leading-tight truncate">
                {state.book.title}
              </p>
              <p className="text-paper-300/60 text-sm">
                {state.book.author_name?.[0] ?? "Unknown"}
                {state.book.first_publish_year
                  ? ` · ${state.book.first_publish_year}`
                  : ""}
              </p>
              {alreadyAdded && (
                <p className="text-amber-400/70 text-xs mt-0.5">
                  Already in your library
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={rescan}
              className="flex-1 py-2.5 rounded-xl border border-paper-300/10 text-paper-300/60 hover:text-paper-100 transition-colors text-sm"
            >
              Scan another
            </button>
            <button
              onClick={() => handleAdd(state.book)}
              disabled={alreadyAdded}
              className="flex-1 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:cursor-default text-ink-900 font-semibold transition-colors text-sm"
            >
              {alreadyAdded ? "Already added" : "Add to wishlist"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
