import { useEffect, useMemo, useState } from "react";

type CheckStatus = "checking" | "ok" | "fail";
type CheckKey = "camera" | "microphone" | "internet" | "speakers" | "browser";

interface StepSystemCheckProps {
  onContinue: () => void;
  active: boolean;
}

interface CheckItem {
  key: CheckKey;
  icon: string;
  name: string;
  value: string;
  status: CheckStatus;
  okLabel: string;
  failLabel: string;
}

const createInitialChecks = (): CheckItem[] => [
  {
    key: "camera",
    icon: "📷",
    name: "Camera",
    value: "Checking camera access...",
    status: "checking",
    okLabel: "Ready",
    failLabel: "Blocked",
  },
  {
    key: "microphone",
    icon: "🎙",
    name: "Microphone",
    value: "Checking microphone access...",
    status: "checking",
    okLabel: "Ready",
    failLabel: "Blocked",
  },
  {
    key: "internet",
    icon: "🌐",
    name: "Internet Speed",
    value: "Testing network speed...",
    status: "checking",
    okLabel: "Good",
    failLabel: "Poor",
  },
  {
    key: "speakers",
    icon: "🔊",
    name: "Speakers / Audio",
    value: "Checking audio output devices...",
    status: "checking",
    okLabel: "Ready",
    failLabel: "Missing",
  },
  {
    key: "browser",
    icon: "💻",
    name: "Browser",
    value: "Checking browser compatibility...",
    status: "checking",
    okLabel: "Good",
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
        const res = settings.width && settings.height ? `${settings.width}x${settings.height} - Active` : "Camera detected - Active";
        camStream.getTracks().forEach((t) => t.stop());
        if (!cancelled) updateCheck("camera", { value: res, status: "ok" });
      } catch {
        if (!cancelled) updateCheck("camera", { value: "Camera permission denied or unavailable", status: "fail" });
      }

      // Microphone
      try {
        const micStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
        const track = micStream.getAudioTracks()[0];
        const label = track?.label ? `${track.label} - Active` : "Microphone detected - Active";
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

        const rtt = typeof connection?.rtt === "number" ? ` - ${connection.rtt} ms RTT` : "";
        const speedText = `${speedMbps.toFixed(1)} Mbps download${rtt}`;
        const good = speedMbps >= 2;

        if (!cancelled) updateCheck("internet", { value: speedText, status: good ? "ok" : "fail" });
      } catch {
        if (!cancelled) updateCheck("internet", { value: "Network test failed", status: "fail" });
      }

      // Speakers / audio output
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const outputs = devices.filter((d) => d.kind === "audiooutput");

        if (outputs.length > 0) {
          const outName = outputs[0].label || "System default";
          if (!cancelled) updateCheck("speakers", { value: `${outName} - Available`, status: "ok" });
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

        let browserName = "Unknown";
        let browserVersion = "";

        if (edgeMatch) {
          browserName = "Edge";
          browserVersion = edgeMatch[1];
        } else if (chromeMatch) {
          browserName = "Chrome";
          browserVersion = chromeMatch[1];
        } else if (firefoxMatch) {
          browserName = "Firefox";
          browserVersion = firefoxMatch[1];
        } else if (safariMatch) {
          browserName = "Safari";
          browserVersion = safariMatch[1];
        }

        const supportsInterviewFeatures =
          !!navigator.mediaDevices?.getUserMedia &&
          !!navigator.mediaDevices?.getDisplayMedia &&
          typeof window.MediaRecorder !== "undefined";

        if (!cancelled) {
          updateCheck("browser", {
            value: `${browserName} ${browserVersion || ""} - ${supportsInterviewFeatures ? "Compatible" : "Limited support"}`.trim(),
            status: supportsInterviewFeatures ? "ok" : "fail",
          });
        }
      } catch {
        if (!cancelled) updateCheck("browser", { value: "Unable to verify browser", status: "fail" });
      }
    };

    runChecks();

    return () => {
      cancelled = true;
    };
  }, [active]);

  const canContinue = useMemo(() => checks.every((c) => c.status === "ok"), [checks]);

  return (
    <div className="pai-card">
      <div className="face-step-card">
        <div className="progress-wrap">
          <div className="progress-label">
            <span>Step 7 of 10</span>
            <span>System Check</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: "70%" }} />
          </div>
        </div>

        <div className="card-icon">🖥</div>
        <div className="card-title">System Check</div>
        <div className="card-sub">Verifying your setup before the interview begins.</div>

        <div className="sys-checks">
          {checks.map((item) => (
            <div className="sys-item" key={item.key}>
              <div className="sys-icon">{item.icon}</div>
              <div className="sys-info">
                <div className="sys-name">{item.name}</div>
                <div className="sys-val">{item.value}</div>
              </div>
              <div className={`sys-state ${item.status === "ok" ? "ok" : item.status === "fail" ? "fail" : "checking"}`}>
                {item.status === "ok" ? `✓ ${item.okLabel}` : item.status === "fail" ? `✕ ${item.failLabel}` : "Checking..."}
              </div>
            </div>
          ))}
        </div>

        <button className="btn-pai btn-pai-primary" onClick={onContinue} disabled={!canContinue}>
          All Good - Continue →
        </button>
      </div>
    </div>
  );
}
