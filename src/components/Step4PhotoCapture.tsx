import { useState, useEffect, useRef } from "react";
import { Sun, EyeOff, Smile, Camera, RefreshCw } from "lucide-react";

interface Step4PhotoCaptureProps {
  cameraStream: MediaStream;
  onNext: (photo: string) => void;
}

export function Step4PhotoCapture({ cameraStream, onNext }: Step4PhotoCaptureProps) {
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [status, setStatus] = useState("Align your face within the oval");
  const [statusOk, setStatusOk] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.srcObject = cameraStream;

    const play = async () => {
      try {
        await video.play();
        setStatus("Hold still — ready to capture");
        setStatusOk(false);
      } catch {
        setStatus("Camera access denied — please allow camera");
        setStatusOk(false);
      }
    };

    play();
  }, [cameraStream]);

  const handleCapturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setIsCapturing(false);
      return;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const image = canvas.toDataURL("image/png");
    setCapturedPhoto(image);
    setStatus("Face captured — you're good to go!");
    setStatusOk(true);

    setTimeout(() => setIsCapturing(false), 350);
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    setStatus("Hold still — ready to capture");
    setStatusOk(false);
    requestAnimationFrame(() => {
      videoRef.current?.play().catch(() => {});
    });
  };

  const handleContinue = () => {
    if (capturedPhoto) onNext(capturedPhoto);
  };

  const guideItems = [
    { icon: <Sun size={14} />, label: "Good lighting" },
    { icon: <EyeOff size={14} />, label: "No glasses glare" },
    { icon: <Smile size={14} />, label: "Neutral expression" },
    { icon: <Camera size={14} />, label: "Face the camera" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-[36rem] rounded-3xl border border-white/10 bg-[rgba(20,22,30,0.85)] p-8 md:p-10 shadow-2xl backdrop-blur-sm">

        {/* Progress */}
        {/* <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Step 5 of 10</span>
            <span>Face Verification</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[50%] rounded-full bg-primary" />
          </div>
        </div> */}

        {/* Title */}
        <h2 className="mb-1.5 text-3xl font-bold">Face Verification</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          Position your face clearly within the oval frame.
        </p>

        {/* Oval Camera Frame */}
        <div className="mb-4 flex justify-center">
          <div
            className={`relative overflow-hidden rounded-[50%] border-4 transition-colors duration-300 ${
              statusOk ? "border-green-500 shadow-[0_0_24px_rgba(34,197,94,0.3)]" : "border-primary/60 shadow-[0_0_24px_rgba(0,200,255,0.15)]"
            }`}
            style={{ width: 220, height: 270 }}
          >
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className={`h-full w-full object-cover transition-opacity duration-300 ${capturedPhoto ? "opacity-0" : "opacity-100"}`}
            />
            {capturedPhoto && (
              <img
                src={capturedPhoto}
                alt="Captured face preview"
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div className="mb-5 flex justify-center">
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs transition-colors duration-300 ${
              statusOk
                ? "border-green-500/40 bg-green-500/10 text-green-400"
                : "border-primary/35 bg-primary/10 text-primary"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${statusOk ? "bg-green-400" : "bg-primary"}`} />
            {status}
          </span>
        </div>

        {/* Guide Tips — 2x2 grid */}
        <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
          {guideItems.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
                {item.icon}
              </span>
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <button
          onClick={capturedPhoto ? handleContinue : handleCapturePhoto}
          disabled={isCapturing}
          className={`mb-3 w-full rounded-xl px-4 py-3 text-primary-foreground transition-all ${
            isCapturing
              ? "cursor-not-allowed bg-primary/50"
              : "bg-primary hover:shadow-lg hover:shadow-primary/20"
          }`}
        >
          {!capturedPhoto
            ? isCapturing
              ? "Capturing..."
              : "Capture Photo →"
            : "Face Verified ✓  Continue →"}
        </button>

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