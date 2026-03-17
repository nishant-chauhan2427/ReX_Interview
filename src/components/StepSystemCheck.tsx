import { useEffect, useMemo, useState } from "react";
import { Camera, Mic, Wifi, Volume2, Monitor, CheckCircle2, XCircle, Loader2 } from "lucide-react";

type CheckStatus = "checking" | "ok" | "fail";
type CheckKey = "camera" | "microphone" | "internet" | "speakers" | "browser";

interface StepSystemCheckProps {
  onContinue: () => void;
  active: boolean;
}

interface CheckItem {
  key: CheckKey;
  icon: React.ReactNode;
  name: string;
  value: string;
  status: CheckStatus;
  okLabel: string;
  failLabel: string;
}

const createInitialChecks = (): CheckItem[] => [
  {
    key: "camera",
    icon: <Camera size={16} />,
    name: "Camera",
    value: "Checking camera access...",
    status: "checking",
    okLabel: "Ready",
    failLabel: "Blocked",
  },
  {
    key: "microphone",
    icon: <Mic size={16} />,
    name: "Microphone",
    value: "Checking microphone access...",
    status: "checking",
    okLabel: "Ready",
    failLabel: "Blocked",
  },
  {
    key: "internet",
    icon: <Wifi size={16} />,
    name: "Internet Speed",
    value: "Testing network speed...",
    status: "checking",
    okLabel: "Good",
    failLabel: "Poor",
  },
  {
    key: "speakers",
    icon: <Volume2 size={16} />,
    name: "Speakers / Audio",
    value: "Checking audio output devices...",
    status: "checking",
    okLabel: "Ready",
    failLabel: "Missing",
  },
  {
    key: "browser",
    icon: <Monitor size={16} />,
    name: "Browser",
    value: "Checking browser compatibility...",
    status: "checking",
    okLabel: "Compatible",
    failLabel: "Limited",
  },
];

export function StepSystemCheck({ onContinue, active }: StepSystemCheckProps) {
  const [checks, setChecks] = useState<CheckItem[]>(createInitialChecks());

  const updateCheck = (key: CheckKey, patch: Partial<CheckItem>) => {
    setChecks((prev) => prev.map((item) => (item.key === key ? { ...item, ...patch } : item)));
  };

  useEffect(() => {
    if (!active) {
      setChecks(createInitialChecks());
      return;
    }

    let cancelled = false;
    const runChecks = async () => {
      setChecks(createInitialChecks());

      // Camera
      try {
        const camStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        const track = camStream.getVideoTracks()[0];
        const settings = track.getSettings();
        const res = settings.width && settings.height
          ? `${settings.width}x${settings.height} — Active`
          : "Camera detected — Active";
        camStream.getTracks().forEach((t) => t.stop());
        if (!cancelled) updateCheck("camera", { value: res, status: "ok" });
      } catch {
        if (!cancelled) updateCheck("camera", { value: "Camera permission denied or unavailable", status: "fail" });
      }

      // Microphone
      try {
        const micStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
        const track = micStream.getAudioTracks()[0];
        const label = track?.label ? `${track.label} — Active` : "Microphone detected — Active";
        micStream.getTracks().forEach((t) => t.stop());
        if (!cancelled) updateCheck("microphone", { value: label, status: "ok" });
      } catch {
        if (!cancelled) updateCheck("microphone", { value: "Microphone permission denied or unavailable", status: "fail" });
      }

      // Internet
      try {
        let speedMbps: number | null = null;
        const connection = (navigator as any).connection;

        if (typeof connection?.downlink === "number") {
          speedMbps = connection.downlink;
        } else {
          const start = performance.now();
          const res = await fetch(`/rex-logo.png?ts=${Date.now()}`, { cache: "no-store" });
          const blob = await res.blob();
          const end = performance.now();
          const seconds = Math.max((end - start) / 1000, 0.001);
          speedMbps = (blob.size * 8) / (seconds * 1_000_000);
        }

        const rtt = typeof connection?.rtt === "number" ? ` — ${connection.rtt} ms RTT` : "";
        const speedText = `${speedMbps.toFixed(1)} Mbps download${rtt}`;
        const good = speedMbps >= 2;
        if (!cancelled) updateCheck("internet", { value: speedText, status: good ? "ok" : "fail" });
      } catch {
        if (!cancelled) updateCheck("internet", { value: "Network test failed", status: "fail" });
      }

      // Speakers
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const outputs = devices.filter((d) => d.kind === "audiooutput");
        if (outputs.length > 0) {
          const outName = outputs[0].label || "System default";
          if (!cancelled) updateCheck("speakers", { value: `${outName} — Available`, status: "ok" });
        } else {
          if (!cancelled) updateCheck("speakers", { value: "No audio output device detected", status: "fail" });
        }
      } catch {
        if (!cancelled) updateCheck("speakers", { value: "Unable to verify speakers", status: "fail" });
      }

      // Browser
      try {
        const ua = navigator.userAgent;
        const chromeMatch = ua.match(/Chrome\/(\d+)/);
        const edgeMatch = ua.match(/Edg\/(\d+)/);
        const firefoxMatch = ua.match(/Firefox\/(\d+)/);
        const safariMatch = ua.match(/Version\/(\d+).+Safari/);

        let browserName = "Unknown", browserVersion = "";
        if (edgeMatch)         { browserName = "Edge";    browserVersion = edgeMatch[1]; }
        else if (chromeMatch)  { browserName = "Chrome";  browserVersion = chromeMatch[1]; }
        else if (firefoxMatch) { browserName = "Firefox"; browserVersion = firefoxMatch[1]; }
        else if (safariMatch)  { browserName = "Safari";  browserVersion = safariMatch[1]; }

        const supported =
          !!navigator.mediaDevices?.getUserMedia &&
          !!navigator.mediaDevices?.getDisplayMedia &&
          typeof window.MediaRecorder !== "undefined";

        if (!cancelled) {
          updateCheck("browser", {
            value: `${browserName} ${browserVersion} — ${supported ? "Compatible" : "Limited support"}`.trim(),
            status: supported ? "ok" : "fail",
          });
        }
      } catch {
        if (!cancelled) updateCheck("browser", { value: "Unable to verify browser", status: "fail" });
      }
    };

    runChecks();
    return () => { cancelled = true; };
  }, [active]);

  const canContinue = useMemo(() => checks.every((c) => c.status === "ok"), [checks]);

  const allDone = checks.every((c) => c.status !== "checking");

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-[38rem] rounded-3xl border border-white/10 bg-[rgba(20,22,30,0.85)] p-8 md:p-10 shadow-2xl backdrop-blur-sm">

        {/* Progress */}
        {/* <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Step 6 of 11</span>
            <span>System Check</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[55%] rounded-full bg-primary" />
          </div>
        </div> */}

        {/* Icon + Title — centered */}
        <div className="mb-3 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/30 bg-primary/10">
            <Monitor className="h-6 w-6 text-primary" strokeWidth={1.5} />
          </div>
        </div>
        <h2 className="mb-2 text-center text-3xl font-bold">System Check</h2>
        <p className="mb-6 text-center text-sm text-muted-foreground">
          Verifying your setup before the interview begins.
        </p>

        {/* Checks List */}
        <div className="mb-6 flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          {checks.map((item) => (
            <div
              key={item.key}
              className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
            >
              {/* Icon */}
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
                {item.icon}
              </span>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground">{item.name}</div>
                <div className="truncate text-xs text-muted-foreground">{item.value}</div>
              </div>

              {/* Status */}
              <div className="shrink-0">
                {item.status === "checking" && (
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Checking
                  </span>
                )}
                {item.status === "ok" && (
                  <span className="flex items-center gap-1.5 text-xs text-green-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {item.okLabel}
                  </span>
                )}
                {item.status === "fail" && (
                  <span className="flex items-center gap-1.5 text-xs text-red-400">
                    <XCircle className="h-3.5 w-3.5" />
                    {item.failLabel}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Button */}
        {/* <button
          onClick={onContinue}
          disabled={!canContinue}
          className={`w-full rounded-xl px-4 py-3 text-primary-foreground transition-all ${
            canContinue
              ? "bg-primary hover:shadow-lg hover:shadow-primary/20"
              : "cursor-not-allowed bg-primary/50"
          }`}
        > */}
        <button
  onClick={onContinue}
  disabled={!canContinue}
  className={`w-full rounded-xl px-4 py-3 transition-all font-medium ${
    canContinue
      ? "bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/20"
      : "cursor-not-allowed border border-white/20 bg-transparent text-white/40"
  }`}
>
          {!allDone ? "Running checks..." : canContinue ? "Continue →" : "Fix issues to continue"}
        </button>

      </div>
    </div>
  );
}