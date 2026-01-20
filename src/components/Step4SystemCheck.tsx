import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import {
  Mic,
  Video,
  Volume2,
  CheckCircle2,
  XCircle,
  Monitor,
  MonitorCheck,
} from "lucide-react";

interface Step4SystemCheckProps {
  onNext: (streams: { camera: MediaStream; screen: MediaStream }) => void;
}

type CheckStatus = "pending" | "checking" | "success" | "failed";

interface SystemCheck {
  id: "microphone" | "camera" | "audio" | "screen";
  label: string;
  icon: any;
  status: CheckStatus;
  errorMessage?: string;
}

export function Step4SystemCheck({ onNext }: Step4SystemCheckProps) {
  const [checks, setChecks] = useState<SystemCheck[]>([
    { id: "microphone", label: "Microphone Access", icon: Mic, status: "pending" },
    { id: "camera", label: "Camera Access", icon: Video, status: "pending" },
    { id: "audio", label: "Audio Output", icon: Volume2, status: "pending" },
    {
      id: "screen",
      label: "Screen Share (Entire Screen)",
      icon: Monitor,
      status: "pending",
    },
  ]);

  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  /* ---------------- HELPERS ---------------- */

  const update = (
    id: SystemCheck["id"],
    status: CheckStatus,
    errorMessage?: string,
  ) => {
    setChecks((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status, errorMessage } : c,
      ),
    );
  };

  const allGranted =
    checks.every((c) => c.status === "success") &&
    !!cameraStream &&
    !!screenStream;

  /* ---------------- MULTI MONITOR DETECTION ---------------- */

  const detectMultipleMonitors = () => {
    const ratio = window.devicePixelRatio || 1;
    const widthDiff =
      window.screen.width * ratio -
      window.screen.availWidth * ratio;

    return widthDiff > 100;
  };

  /* ---------------- PERMISSION CHECKS ---------------- */

  const checkMicrophone = async () => {
    update("microphone", "checking");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      update("microphone", "success");
    } catch {
      update("microphone", "failed", "Microphone permission denied");
    }
  };

  const checkCamera = async () => {
    update("camera", "checking");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      setCameraStream(stream);
      update("camera", "success");
    } catch {
      update("camera", "failed", "Camera permission denied");
    }
  };

  const checkAudio = async () => {
    update("audio", "checking");
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const ok = devices.some((d) => d.kind === "audiooutput");
      ok
        ? update("audio", "success")
        : update("audio", "failed", "No audio output detected");
    } catch {
      update("audio", "failed", "Audio check failed");
    }
  };

  const checkScreen = async () => {
    update("screen", "checking");

    try {
      if (detectMultipleMonitors()) {
        update(
          "screen",
          "failed",
          "Multiple monitors detected. Use a single screen.",
        );
        return;
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always" },
        audio: false,
      });

      const track = stream.getVideoTracks()[0];
      const surface = track.getSettings().displaySurface;

      if (surface !== "monitor") {
        track.stop();
        update(
          "screen",
          "failed",
          'You must share "Entire Screen" only',
        );
        return;
      }

      setScreenStream(stream);
      setIsRecording(true);
      update("screen", "success");

      /* ---- STOP IF SCREEN SHARING ENDS ---- */
      track.onended = () => {
        setScreenStream(null);
        setIsRecording(false);
        update("screen", "failed", "Screen sharing stopped");
      };
    } catch {
      update("screen", "failed", "Screen permission denied");
    }
  };

  /* ---------------- AUTO RUN NON-SCREEN CHECKS ---------------- */

  useEffect(() => {
    (async () => {
      await checkMicrophone();
      await checkCamera();
      await checkAudio();
    })();
  }, []);

  /* ---------------- CAMERA PREVIEW ---------------- */

  useEffect(() => {
    if (cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch(() => {});
    }
  }, [cameraStream]);

  /* ---------------- FOCUS / BLUR ENFORCEMENT ---------------- */

  useEffect(() => {
    const handleViolation = () => {
      if (!screenStream) return;

      screenStream.getTracks().forEach((t) => t.stop());
      setScreenStream(null);
      setIsRecording(false);
      update("screen", "failed", "Screen focus lost");
    };

    window.addEventListener("blur", handleViolation);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) handleViolation();
    });

    return () => {
      window.removeEventListener("blur", handleViolation);
      document.removeEventListener("visibilitychange", handleViolation);
    };
  }, [screenStream]);

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      {isRecording && (
        <div className="fixed inset-0 border-[6px] border-red-500 pointer-events-none z-50" />
      )}

      <div className="max-w-2xl w-full glass-card rounded-3xl p-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
            <MonitorCheck className="w-6 h-6 text-secondary" />
          </div>
          <div>
            <h2 className="text-2xl">System Check</h2>
            <p className="text-muted-foreground">
              Check and give permissions
            </p>
          </div>
        </div>

        {/* CAMERA PREVIEW */}
        <div className="aspect-video rounded-xl overflow-hidden border mb-6">
          {cameraStream ? (
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Waiting for camera…
            </div>
          )}
        </div>

        {/* CHECK LIST */}
        <div className="space-y-3 mb-6">
          {checks.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.id}
                className={`flex items-center justify-between p-4 rounded-xl border ${
                  c.status === "failed"
                    ? "border-destructive/40 bg-destructive/5"
                    : "border-border bg-accent/20"
                }`}
              >
                <div className="flex items-center gap-4">
                  <Icon className="w-5 h-5" />
                  <span>{c.label}</span>
                </div>

                {c.status === "checking" && (
                  <motion.div
                    className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  />
                )}
                {c.status === "success" && (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                )}
                {c.status === "failed" && (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
            );
          })}
        </div>

        {/* SCREEN SHARE */}
        <motion.button
          onClick={checkScreen}
          disabled={checks.find((c) => c.id === "screen")?.status === "success"}
          className={`w-full py-4 rounded-xl font-medium bg-primary ${
            checks.find((c) => c.id === "screen")?.status === "success"
              ? "bg-primary text-primary-foreground bg-primary text-primary-foreground"
              : "text-foreground "
          }`}
        >
          Start Screen Sharing & Continue to Interview
        </motion.button>

        {/* FINAL CONTINUE */}
        <motion.button
          disabled={!allGranted}
          onClick={() =>
            onNext({ camera: cameraStream!, screen: screenStream! })
          }
          className={`w-full mt-3 py-4 rounded-xl font-medium ${
            allGranted
              ? "bg-green-600 text-white"
              : "bg-muted text-muted-foreground opacity-50"
          }`}
        >
          Continue to Interview
        </motion.button>
      </div>
    </div>
  );
}
