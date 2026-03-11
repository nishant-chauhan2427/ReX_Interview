// import { useState, useCallback, useEffect, useRef } from "react";

// interface StepScreenShareProps {
//   cameraStream: MediaStream | null;
//   onNext: (streams: { camera: MediaStream; screen: MediaStream }) => void;
// }

// export function StepScreenShare({ cameraStream, onNext }: StepScreenShareProps) {
//   const [sharing, setSharing] = useState(false);
//   const [error, setError] = useState("");
//   const streamRef = useRef<MediaStream | null>(null);

//   const startShare = useCallback(async () => {
//     try {
//       setError("");

//       const stream = await navigator.mediaDevices.getDisplayMedia({
//         video: { displaySurface: "monitor" } as any,
//       });

//       const track = stream.getVideoTracks()[0];
//       const settings = track.getSettings() as any;

//       if (settings.displaySurface && settings.displaySurface !== "monitor") {
//         stream.getTracks().forEach((t) => t.stop());
//         setError("You must share your Entire Screen. Window or tab sharing is not allowed.");
//         return;
//       }

//       streamRef.current = stream;
//       setSharing(true);

//       track.onended = () => {
//         setSharing(false);
//         streamRef.current = null;
//         setError("Screen sharing stopped. Please share your entire screen again.");
//       };
//     } catch {
//       setError("Screen sharing was denied. You must share your entire screen to continue.");
//     }
//   }, []);

//   const handleContinue = useCallback(() => {
//     if (!cameraStream || !streamRef.current) {
//       setError("Camera or screen stream is missing. Please retry.");
//       return;
//     }

//     onNext({ camera: cameraStream, screen: streamRef.current });
//   }, [cameraStream, onNext]);

//   useEffect(() => {
//     return () => {
//       // Keep stream alive across the next steps; App owns final lifecycle.
//     };
//   }, []);

//   return (
//     <div className="pai-card">
//       <div className="face-step-card">
//         <div className="progress-wrap">
//           <div className="progress-label">
//             <span>Step 6 of 10</span>
//             <span>Screen Sharing</span>
//           </div>
//           <div className="progress-bar">
//             <div className="progress-fill" style={{ width: "60%" }} />
//           </div>
//         </div>

//         <div className="card-icon">🖥️</div>
//         <div className="card-title">Screen Share Required</div>
//         <div className="card-sub">
//           Full screen monitoring is required for this interview. You must share your <strong>entire screen</strong> -
//           window or tab sharing is not allowed.
//         </div>

//         <div className="screen-note">
//           ⚠️ <strong>Important:</strong> When prompted, select <strong>"Entire Screen"</strong> (not a window or
//           tab). Screen sharing will be monitored throughout the interview. If sharing stops at any point, the
//           interview will be paused.
//         </div>

//         {error && <div className="screen-error">{error}</div>}

//         {sharing ? <div className="screen-ok">✓ Entire screen is being shared</div> : null}

//         {!sharing ? (
//           <button className="btn-pai btn-pai-primary" onClick={startShare}>
//             🖥️ Share Entire Screen
//           </button>
//         ) : (
//           <button className="btn-pai btn-pai-primary" onClick={handleContinue}>
//             Continue →
//           </button>
//         )}
//       </div>
//     </div>
//   );
// }


import { useState, useCallback, useEffect, useRef } from "react";
import { Monitor, AlertTriangle, CheckCircle, MonitorPlay } from "lucide-react";

interface StepScreenShareProps {
  cameraStream: MediaStream | null;
  onNext: (streams: { camera: MediaStream; screen: MediaStream }) => void;
}

export function StepScreenShare({ cameraStream, onNext }: StepScreenShareProps) {
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState("");
  const streamRef = useRef<MediaStream | null>(null);

  const startShare = useCallback(async () => {
    try {
      setError("");
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: "monitor" } as any,
      });

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
    <div className="pai-card">
      <div className="face-step-card">
        <div className="progress-wrap">
          <div className="progress-label">
            <span>Step 6 of 10</span>
            <span>Screen Sharing</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: "60%" }} />
          </div>
        </div>

        {/* ✅ Monitor icon instead of 🖥️ */}
        <div className="card-icon">
          <Monitor size={28} strokeWidth={1.5} />
        </div>
        <div className="card-title">Screen Share Required</div>
        <div className="card-sub">
          Full screen monitoring is required for this interview. You must share your <strong>entire screen</strong> —
          window or tab sharing is not allowed.
        </div>

        <div className="screen-note">
          {/* ✅ AlertTriangle instead of ⚠️ */}
          <AlertTriangle size={14} style={{ display: "inline", marginRight: "6px", verticalAlign: "middle" }} />
          <strong>Important:</strong> When prompted, select <strong>"Entire Screen"</strong> (not a window or tab).
          Screen sharing will be monitored throughout the interview. If sharing stops, the interview will be paused.
        </div>

        {error && <div className="screen-error">{error}</div>}

        {/* ✅ CheckCircle instead of ✓ */}
        {sharing && (
          <div className="screen-ok">
            <CheckCircle size={14} style={{ display: "inline", marginRight: "6px", verticalAlign: "middle" }} />
            Entire screen is being shared
          </div>
        )}

        {!sharing ? (
          <button className="btn-pai btn-pai-primary" onClick={startShare}>
            {/* ✅ MonitorPlay instead of 🖥️ */}
            <MonitorPlay size={16} style={{ display: "inline", marginRight: "8px", verticalAlign: "middle" }} />
            Share Entire Screen
          </button>
        ) : (
          <button className="btn-pai btn-pai-primary" onClick={handleContinue}>
            Continue →
          </button>
        )}
      </div>
    </div>
  );
}