// import { useState, useEffect, useRef } from "react";
// import { Sun, EyeOff, Smile, Camera, RefreshCw } from "lucide-react";

// interface Step4PhotoCaptureProps {
//   cameraStream: MediaStream;
//   onNext: (photo: string) => void;
// }

// export function Step4PhotoCapture({ cameraStream, onNext }: Step4PhotoCaptureProps) {
//   const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
//   const [isCapturing, setIsCapturing] = useState(false);
//   const [status, setStatus] = useState("Align your face within the oval");
//   const [statusOk, setStatusOk] = useState(false);

//   const videoRef = useRef<HTMLVideoElement>(null);
//   const canvasRef = useRef<HTMLCanvasElement>(null);

//   useEffect(() => {
//     const video = videoRef.current;
//     if (!video) return;

//     video.srcObject = cameraStream;

//     const play = async () => {
//       try {
//         await video.play();
//         setStatus("Hold still — ready to capture");
//         setStatusOk(false);
//       } catch {
//         setStatus("Camera access denied — please allow camera");
//         setStatusOk(false);
//       }
//     };

//     play();
//   }, [cameraStream]);

//   const handleCapturePhoto = () => {
//     if (!videoRef.current || !canvasRef.current) return;

//     setIsCapturing(true);

//     const video = videoRef.current;
//     const canvas = canvasRef.current;

//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;

//     const ctx = canvas.getContext("2d");
//     if (!ctx) {
//       setIsCapturing(false);
//       return;
//     }

//     ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
//     const image = canvas.toDataURL("image/png");
//     setCapturedPhoto(image);
//     setStatus("Face captured — you're good to go!");
//     setStatusOk(true);

//     setTimeout(() => setIsCapturing(false), 350);
//   };

//   const handleRetake = () => {
//     setCapturedPhoto(null);
//     setStatus("Hold still — ready to capture");
//     setStatusOk(false);
//     requestAnimationFrame(() => {
//       videoRef.current?.play().catch(() => {});
//     });
//   };

//   const handleContinue = () => {
//     if (capturedPhoto) onNext(capturedPhoto);
//   };

//   const guideItems = [
//     { icon: <Sun size={14} />, label: "Good lighting" },
//     { icon: <EyeOff size={14} />, label: "No glasses glare" },
//     { icon: <Smile size={14} />, label: "Neutral expression" },
//     { icon: <Camera size={14} />, label: "Face the camera" },
//   ];

//   return (
//     <div className="min-h-screen flex items-center justify-center p-6">
//       <div className="w-full max-w-[36rem] rounded-3xl border border-white/10 bg-[rgba(20,22,30,0.85)] p-8 md:p-10 shadow-2xl backdrop-blur-sm">

//         {/* Progress */}
//         {/* <div className="mb-6">
//           <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
//             <span>Step 5 of 10</span>
//             <span>Face Verification</span>
//           </div>
//           <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
//             <div className="h-full w-[50%] rounded-full bg-primary" />
//           </div>
//         </div> */}

//         {/* Title */}
//         <h2 className="mb-1.5 text-3xl font-bold">Face Verification</h2>
//         <p className="mb-6 text-sm text-muted-foreground">
//           Position your face clearly within the oval frame.
//         </p>

//         {/* Oval Camera Frame */}
//         <div className="mb-4 flex justify-center">
//           <div
//             className={`relative overflow-hidden rounded-[50%] border-4 transition-colors duration-300 ${
//               statusOk ? "border-green-500 shadow-[0_0_24px_rgba(34,197,94,0.3)]" : "border-primary/60 shadow-[0_0_24px_rgba(0,200,255,0.15)]"
//             }`}
//             style={{ width: 220, height: 270 }}
//           >
//             <video
//               ref={videoRef}
//               autoPlay
//               muted
//               playsInline
//               className={`h-full w-full object-cover transition-opacity duration-300 ${capturedPhoto ? "opacity-0" : "opacity-100"}`}
//             />
//             {capturedPhoto && (
//               <img
//                 src={capturedPhoto}
//                 alt="Captured face preview"
//                 className="absolute inset-0 h-full w-full object-cover"
//               />
//             )}
//           </div>
//         </div>

//         {/* Status Badge */}
//         <div className="mb-5 flex justify-center">
//           <span
//             className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs transition-colors duration-300 ${
//               statusOk
//                 ? "border-green-500/40 bg-green-500/10 text-green-400"
//                 : "border-primary/35 bg-primary/10 text-primary"
//             }`}
//           >
//             <span className={`h-1.5 w-1.5 rounded-full ${statusOk ? "bg-green-400" : "bg-primary"}`} />
//             {status}
//           </span>
//         </div>

//         {/* Guide Tips — 2x2 grid */}
//         <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
//           {guideItems.map((item, i) => (
//             <div
//               key={i}
//               className="flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2"
//             >
//               <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
//                 {item.icon}
//               </span>
//               <span className="text-xs text-muted-foreground">{item.label}</span>
//             </div>
//           ))}
//         </div>

//         {/* Action Buttons */}
//         <button
//           onClick={capturedPhoto ? handleContinue : handleCapturePhoto}
//           disabled={isCapturing}
//           className={`mb-3 w-full rounded-xl px-4 py-3 text-primary-foreground transition-all ${
//             isCapturing
//               ? "cursor-not-allowed bg-primary/50"
//               : "bg-primary hover:shadow-lg hover:shadow-primary/20"
//           }`}
//         >
//           {!capturedPhoto
//             ? isCapturing
//               ? "Capturing..."
//               : "Capture Photo →"
//             : "Face Verified ✓  Continue →"}
//         </button>

//         <button
//           onClick={handleRetake}
//           className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-muted-foreground transition-colors hover:bg-white/5"
//         >
//           <RefreshCw className="h-4 w-4" />
//           Retry Camera
//         </button>

//         <canvas ref={canvasRef} className="hidden" />
//       </div>
//     </div>
//   );
// }

import { useState, useEffect, useRef, useCallback } from "react";
import { Sun, EyeOff, Smile, Camera, RefreshCw,Loader2, ScanFace } from "lucide-react";

interface Step4PhotoCaptureProps {
  cameraStream: MediaStream;
  onNext: (photo: string) => void;
}

const HOLD_FRAMES = 20; // ~0.7s at ~30fps

type CheckStatus = "loading" | "no_face" | "too_far" | "too_close" | "off_center" | "ok" | "captured";

const STATUS_MESSAGES: Record<CheckStatus, string> = {
  loading:    "Loading face detection…",
  no_face:    "No face detected — move closer",
  too_far:    "Move closer to the camera",
  too_close:  "Move a bit further back",
  off_center: "Center your face in the oval",
  ok:         "Hold still — capturing…",
  captured:   "Face captured — you're good to go!",
};

export function Step4PhotoCapture({ cameraStream, onNext }: Step4PhotoCaptureProps) {
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [status, setStatus] = useState<CheckStatus>("loading");
  const [holdProgress, setHoldProgress] = useState(0);
  const [modelReady, setModelReady] = useState(false);

  const videoRef     = useRef<HTMLVideoElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const modelRef     = useRef<any>(null);
  const rafRef       = useRef<number>(0);
  const holdCount    = useRef(0);
  const capturedFlag = useRef(false);

  // ── load TF + BlazeFace via CDN scripts ─────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const loadScripts = async () => {
      const load = (src: string) =>
        new Promise<void>((res, rej) => {
          if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
          const s = document.createElement("script");
          s.src = src; s.async = true;
          s.onload = () => res();
          s.onerror = () => rej(new Error(`Failed to load ${src}`));
          document.head.appendChild(s);
        });

      try {
        await load("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.17.0/dist/tf.min.js");
        await load("https://cdn.jsdelivr.net/npm/@tensorflow-models/blazeface@0.0.7/dist/blazeface.min.js");
        if (cancelled) return;

        // @ts-ignore
        const model = await window.blazeface.load();
        if (cancelled) return;
        modelRef.current = model;
        setModelReady(true);
        setStatus("no_face");
      } catch (e) {
        console.error("BlazeFace load failed", e);
        // fallback to manual
        if (!cancelled) setStatus("no_face");
      }
    };

    loadScripts();
    return () => { cancelled = true; };
  }, []);

  // ── capture helper ───────────────────────────────────────────────────────────
  const doCapture = useCallback(() => {
    if (capturedFlag.current) return;
    capturedFlag.current = true;
    cancelAnimationFrame(rafRef.current);

    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width  = video.videoWidth  || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const image = canvas.toDataURL("image/png");
    setCapturedPhoto(image);
    setStatus("captured");
    setHoldProgress(100);
  }, []);

  // ── detection loop ───────────────────────────────────────────────────────────
  const detect = useCallback(async () => {
    if (capturedFlag.current) return;
    const video = videoRef.current;
    const model = modelRef.current;
    if (!video || !model || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(detect);
      return;
    }

    try {
      const predictions = await model.estimateFaces(video, false);

      if (!predictions || predictions.length === 0) {
        holdCount.current = 0;
        setHoldProgress(0);
        setStatus("no_face");
      } else {
        const face = predictions[0];
        const [x1, y1] = face.topLeft   as [number, number];
        const [x2, y2] = face.bottomRight as [number, number];

        const faceW  = x2 - x1;
        const faceH  = y2 - y1;
        const vidW   = video.videoWidth  || 640;
        const vidH   = video.videoHeight || 480;

        const faceFracW   = faceW / vidW;
        const faceCenterX = (x1 + faceW / 2) / vidW; // 0-1
        const faceCenterY = (y1 + faceH / 2) / vidH;

        const offX = Math.abs(faceCenterX - 0.5);
        const offY = Math.abs(faceCenterY - 0.5);

        let nextStatus: CheckStatus;
        if (faceFracW < 0.18)                         nextStatus = "too_far";
        else if (faceFracW > 0.75)                    nextStatus = "too_close";
        else if (offX > 0.20 || offY > 0.22)          nextStatus = "off_center";
        else                                           nextStatus = "ok";

        setStatus(nextStatus);

        if (nextStatus === "ok") {
          holdCount.current += 1;
          const pct = Math.min((holdCount.current / HOLD_FRAMES) * 100, 100);
          setHoldProgress(pct);
          if (holdCount.current >= HOLD_FRAMES) {
            doCapture();
            return;
          }
        } else {
          holdCount.current = 0;
          setHoldProgress(0);
        }
      }
    } catch (e) {
      // skip frame
    }

    rafRef.current = requestAnimationFrame(detect);
  }, [doCapture]);

  // ── start video + loop ───────────────────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.srcObject = cameraStream;
    video.play().catch(() => {});

    return () => { cancelAnimationFrame(rafRef.current); };
  }, [cameraStream]);

  useEffect(() => {
    if (!modelReady) return;
    rafRef.current = requestAnimationFrame(detect);
    return () => cancelAnimationFrame(rafRef.current);
  }, [modelReady, detect]);

  // ── retake ───────────────────────────────────────────────────────────────────
  const handleRetake = () => {
    setCapturedPhoto(null);
    capturedFlag.current = false;
    holdCount.current    = 0;
    setHoldProgress(0);
    setStatus(modelReady ? "no_face" : "loading");
    requestAnimationFrame(() => {
      videoRef.current?.play().catch(() => {});
      if (modelReady) rafRef.current = requestAnimationFrame(detect);
    });
  };

  const handleManualCapture = () => doCapture();
  const handleContinue = () => { if (capturedPhoto) onNext(capturedPhoto); };

  // ── derived UI ───────────────────────────────────────────────────────────────
  const isCaptured = status === "captured";
  const isHolding  = status === "ok" && !capturedPhoto;

  const borderCls = isCaptured
    ? "border-green-500 shadow-[0_0_28px_rgba(34,197,94,0.45)]"
    : isHolding
    ? "border-yellow-400 shadow-[0_0_24px_rgba(250,204,21,0.35)]"
    : "border-primary/60 shadow-[0_0_20px_rgba(0,200,255,0.12)]";

  const badgeCls = isCaptured
    ? "border-green-500/40 bg-green-500/10 text-green-400"
    : isHolding
    ? "border-yellow-400/40 bg-yellow-400/10 text-yellow-300"
    : "border-primary/35 bg-primary/10 text-primary";

  const dotCls = isCaptured ? "bg-green-400" : isHolding ? "bg-yellow-400 animate-pulse" : "bg-primary animate-pulse";

  // SVG progress ring around oval
  const OW = 220; const OH = 270;
  const rx = OW / 2 + 6; const ry = OH / 2 + 6;
  const perim = Math.PI * (3 * (rx + ry) - Math.sqrt((3 * rx + ry) * (rx + 3 * ry)));
  const dashFill = (holdProgress / 100) * perim;

  const guideItems = [
    { icon: <Sun size={14} />,    label: "Good lighting" },
    { icon: <EyeOff size={14} />, label: "No glasses glare" },
    { icon: <Smile size={14} />,  label: "Neutral expression" },
    { icon: <Camera size={14} />, label: "Face the camera" },
  ];

  const svgW = OW + 20; const svgH = OH + 20;

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-[36rem] rounded-3xl border border-white/10 bg-[rgba(20,22,30,0.85)] p-8 md:p-10 shadow-2xl backdrop-blur-sm">

        <h2 className="mb-1.5 text-3xl font-bold">Face Verification</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          Position your face in the oval — it will capture automatically.
        </p>

        {/* Oval + ring */}
        <div className="mb-4 flex justify-center">
          <div className="relative" style={{ width: svgW, height: svgH }}>

            {/* Yellow progress ring */}
            {isHolding && (
              <svg
                className="absolute inset-0 pointer-events-none"
                width={svgW} height={svgH}
                viewBox={`0 0 ${svgW} ${svgH}`}
                style={{ overflow: "visible" }}
              >
                <ellipse
                  cx={svgW / 2} cy={svgH / 2}
                  rx={rx} ry={ry}
                  fill="none"
                  stroke="rgba(250,204,21,0.15)"
                  strokeWidth="4"
                />
                <ellipse
                  cx={svgW / 2} cy={svgH / 2}
                  rx={rx} ry={ry}
                  fill="none"
                  stroke="#facc15"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${dashFill} ${perim}`}
                  style={{ transformOrigin: `${svgW / 2}px ${svgH / 2}px`, transform: "rotate(-90deg)" }}
                />
              </svg>
            )}

            {/* Green ring on captured */}
            {isCaptured && (
              <svg
                className="absolute inset-0 pointer-events-none"
                width={svgW} height={svgH}
                viewBox={`0 0 ${svgW} ${svgH}`}
              >
                <ellipse
                  cx={svgW / 2} cy={svgH / 2}
                  rx={rx} ry={ry}
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="4"
                />
              </svg>
            )}

            {/* Oval video/photo */}
            <div
              className={`absolute rounded-[50%] overflow-hidden border-4 transition-all duration-300 ${borderCls}`}
              style={{ width: OW, height: OH, top: 10, left: 10 }}
            >
              <video
                ref={videoRef}
                autoPlay muted playsInline
                className={`h-full w-full object-cover transition-opacity duration-300 ${capturedPhoto ? "opacity-0" : "opacity-100"}`}
              />
              {capturedPhoto && (
                <img
                  src={capturedPhoto}
                  alt="Captured"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
            </div>
          </div>
        </div>

        {/* Status badge */}
        <div className="mb-5 flex justify-center">
          <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs transition-colors duration-300 ${badgeCls}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${dotCls}`} />
            {STATUS_MESSAGES[status]}
          </span>
        </div>

        {/* Guide */}
        <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
          {guideItems.map((item, i) => (
            <div key={i} className="flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
                {item.icon}
              </span>
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Buttons */}
        {capturedPhoto ? (
          <button
            onClick={handleContinue}
            className="mb-3 w-full rounded-xl border border-primary bg-primary px-4 py-3 text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/20"
          >
             Continue →
          </button>
        ) : (
          <>
            {/* Progress pill shown during auto mode */}
            {/* <div className="mb-3 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-center text-sm text-muted-foreground">
              {status === "loading"
                ? "⏳ Loading face model…"
                : isHolding
                ? `Auto-capturing… ${Math.round(holdProgress)}%`
                : "👤 Align your face to auto-capture"}
            </div> */}
            {/* Manual fallback — always visible as secondary */}
            <div className="mb-3 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-center text-sm text-muted-foreground">
  {status === "loading" ? (
    <span className="inline-flex items-center justify-center gap-2">
      <Loader2 className="h-4 w-4 animate-spin" />
      {/* Loading face model… */}
      Preparing camera, please wait…
    </span>
  ) : isHolding ? (
    <span className="inline-flex items-center justify-center gap-2 text-yellow-300">
      <Camera className="h-4 w-4 animate-pulse" />
      Auto-capturing… {Math.round(holdProgress)}%
    </span>
  ) : (
    <span className="inline-flex items-center justify-center gap-2">
      <ScanFace className="h-4 w-4" />
      Align your face to auto-capture
    </span>
  )}
</div>
            <button
              onClick={handleManualCapture}
              disabled={status === "loading"}
              className={`mb-3 w-full rounded-xl border px-4 py-3 text-sm transition-all
                ${status === "loading"
                  ? "border-white/10 text-white/20 cursor-not-allowed"
                  : "border-white/20 text-muted-foreground hover:bg-white/5"}`}
            >
              <Camera className="inline mr-2 h-4 w-4" />
              Capture Manually
            </button>
          </>
        )}

        <button
          onClick={handleRetake}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-muted-foreground transition-colors hover:bg-white/5"
        >
          <RefreshCw className="h-4 w-4" />
          Retry Camera
        </button>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}