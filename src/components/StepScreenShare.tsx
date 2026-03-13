import { useState, useCallback, useRef } from "react";
import { Monitor, Info, AlertTriangle, CheckCircle2, MonitorPlay } from "lucide-react";

interface StepScreenShareProps {
  cameraStream: MediaStream | null;
  onNext: (streams: { camera: MediaStream; screen: MediaStream }) => void;
}

export function StepScreenShare({ cameraStream, onNext }: StepScreenShareProps) {
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState("");
  const [showGuide, setShowGuide] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const startShare = useCallback(async () => {
    setShowGuide(false);
    setError("");
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: "monitor" } as any,
        audio: false,
      } as any);

      const track = stream.getVideoTracks()[0];
      const settings = track.getSettings() as any;

      if (settings.displaySurface && settings.displaySurface !== "monitor") {
        stream.getTracks().forEach((t) => t.stop());
        setError("You must share your Entire Screen. Window or tab sharing is not allowed.");
        return;
      }

      streamRef.current = stream;
      setSharing(true);

      track.onended = () => {
        setSharing(false);
        streamRef.current = null;
        setError("Screen sharing stopped. Please share your entire screen again.");
      };
    } catch {
      setError("Screen sharing was denied. You must share your entire screen to continue.");
    }
  }, []);

  const handleContinue = useCallback(() => {
    if (!cameraStream || !streamRef.current) {
      setError("Camera or screen stream is missing. Please retry.");
      return;
    }
    onNext({ camera: cameraStream, screen: streamRef.current });
  }, [cameraStream, onNext]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">

      {/* Step-by-step guide overlay before dialog opens */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[rgba(20,22,30,0.97)] p-7 shadow-2xl">
            <h3 className="mb-1 text-lg font-semibold text-center">Follow these steps</h3>
            <p className="mb-5 text-center text-xs text-muted-foreground">A browser dialog will open right after</p>

            <ol className="space-y-3 mb-6">
              {[
                { num: "1", text: 'Click the "Entire screen" tab at the top' },
                { num: "2", text: "Select your screen thumbnail" },
                { num: "3", text: 'Click "Share" to confirm' },
              ].map((s) => (
                <li key={s.num} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary border border-primary/30">
                    {s.num}
                  </span>
                  <span className="text-sm text-muted-foreground">{s.text}</span>
                </li>
              ))}
            </ol>

            <button
              onClick={startShare}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/20"
            >
              <MonitorPlay className="h-4 w-4" />
              Open Share Dialog
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-[36rem] rounded-3xl border border-white/10 bg-[rgba(20,22,30,0.85)] p-8 md:p-10 shadow-2xl backdrop-blur-sm">

        {/* Icon + Title */}
        <div className="mb-3 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/30 bg-primary/10">
            <Monitor className="h-6 w-6 text-primary" strokeWidth={1.5} />
          </div>
        </div>
        <h2 className="mb-2 text-center text-3xl font-bold">Screen Share Required</h2>
        <p className="mb-5 text-center text-sm text-muted-foreground">
          Full screen monitoring is required for this interview. You must share your{" "}
          <strong className="text-foreground">entire screen</strong> — window or tab sharing is not allowed.
        </p>

        {/* Info Note */}
        <div className="mb-5 rounded-2xl border border-yellow-500/25 bg-yellow-500/[0.07] p-4">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-yellow-400" />
            <p className="text-sm text-muted-foreground">
              <strong className="text-yellow-400">Important:</strong> When prompted, select{" "}
              <strong className="text-foreground">"Entire Screen"</strong> tab (not a window or tab). Screen sharing
              will be monitored throughout the interview.
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Success */}
        {sharing && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-green-500/30 bg-green-500/10 p-4">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-green-400" />
            <p className="text-sm text-green-400">Entire screen is being shared</p>
          </div>
        )}

        {/* Button */}
        {!sharing ? (
          <button
            onClick={() => setShowGuide(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/20"
          >
            <MonitorPlay className="h-4 w-4" />
            Share Entire Screen
          </button>
        ) : (
          <button
            onClick={handleContinue}
            className="w-full rounded-xl bg-primary px-4 py-3 text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/20"
          >
            Continue →
          </button>
        )}
      </div>
    </div>
  );
}