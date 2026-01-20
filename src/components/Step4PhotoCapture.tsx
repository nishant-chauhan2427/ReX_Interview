import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import {
  Camera,
  CheckCircle2,
  RotateCw,
  Upload,
  User,
  AlertCircle,
} from "lucide-react";

interface Step4PhotoCaptureProps {
  cameraStream: MediaStream;
  onNext: (photo: string) => void;
}

export function Step4PhotoCapture({
  cameraStream,
  onNext,
}: Step4PhotoCaptureProps) {
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /* ---------------- ATTACH CAMERA (NEVER UNMOUNT VIDEO) ---------------- */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.srcObject = cameraStream;

    const play = async () => {
      try {
        await video.play();
      } catch {
        // Safari sometimes blocks – safe to ignore
      }
    };

    play();
  }, [cameraStream]);

  /* ---------------- CAPTURE PHOTO ---------------- */
  const handleCapturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const image = canvas.toDataURL("image/png");
    setCapturedPhoto(image);

    setTimeout(() => setIsCapturing(false), 350);
  };

  /* ---------------- RETAKE ---------------- */
  const handleRetake = () => {
    setCapturedPhoto(null);

    // Force browser to re-render stream
    requestAnimationFrame(() => {
      videoRef.current?.play().catch(() => {});
    });
  };

  const handleContinue = () => {
    if (capturedPhoto) onNext(capturedPhoto);
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="glass-card rounded-3xl p-8">
          {/* HEADER */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
              <User className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <h2 className="text-2xl">Photo Verification</h2>
              <p className="text-muted-foreground">
                Take a clear photo of yourself
              </p>
            </div>
          </motion.div>

          {/* GUIDELINES */}
          <div className="mb-6 p-4 rounded-xl border bg-accent/20">
            <h3 className="flex items-center gap-2 mb-2 text-sm font-medium">
              <AlertCircle className="w-4 h-4 text-primary" />
              Guidelines
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Face clearly visible</li>
              <li>• No sunglasses or mask</li>
              <li>• Look straight at the camera</li>
            </ul>
          </div>

          {/* CAMERA PREVIEW */}
          <div className="relative mb-6">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden border bg-black relative">
              <div className="absolute inset-0">
                {/* VIDEO (ALWAYS MOUNTED) */}
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    capturedPhoto ? "opacity-0" : "opacity-100"
                  }`}
                />

                {/* CAPTURED IMAGE */}
                {capturedPhoto && (
                  <motion.img
                    src={capturedPhoto}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}

                {/* FACE GUIDE */}
                {!capturedPhoto && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-64 h-80 rounded-[40%] border-4 border-yellow-500" />
                  </div>
                )}
              </div>

              {/* CAPTURING SPINNER */}
              {isCapturing && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                  <motion.div
                    className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* ACTIONS */}
          {!capturedPhoto ? (
            <button
              onClick={handleCapturePhoto}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground flex items-center justify-center gap-2"
            >
              <Camera className="w-5 h-5" />
              Capture Photo
            </button>
          ) : (
            <div className="space-y-3">
              <button
                onClick={handleRetake}
                className="w-full flex items-center justify-center gap-2"
              >
                <RotateCw className="w-5 h-5" />
                Retake Photo
              </button>

              <button
                onClick={handleContinue}
                className="w-full py-4 rounded-xl bg-primary text-primary-foreground flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                Continue
              </button>
            </div>
          )}

          {/* PRIVACY */}
          <div className="mt-6 p-4 rounded-xl bg-primary/5 border">
            <div className="flex gap-3 text-sm">
              <Upload className="w-4 h-4 text-primary mt-0.5" />
              <p className="text-muted-foreground">
                Your photo is encrypted and used only for verification.
              </p>
            </div>
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
