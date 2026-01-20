import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Camera,
  CheckCircle2,
  RefreshCw,
  CreditCard,
  Upload,
  AlertCircle,
} from "lucide-react";
import { postForm } from "../utils/api";
import { toast } from "react-hot-toast";

interface Step3AadharVerificationProps {
  onNext: (data: AadharData) => void;
}

export interface AadharData {
  frontImage: string | null;
  backImage: string | null;
}

type CaptureMode = "front" | "back";

export function Step3AadharVerification({
  onNext,
}: Step3AadharVerificationProps) {
  const [captureMode, setCaptureMode] = useState<CaptureMode>("front");
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [useFileUpload, setUseFileUpload] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAligned, setIsAligned] = useState(false);
const [isTooSmall, setIsTooSmall] = useState(false);
const [isTooClose, setIsTooClose] = useState(false);
const [stillStartTime, setStillStartTime] = useState<number | null>(null);


  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const analysisCanvasRef = useRef<HTMLCanvasElement>(null);



  const analyzeFrame = () => {
  if (!videoRef.current || !analysisCanvasRef.current) return;

  const video = videoRef.current;
  const canvas = analysisCanvasRef.current;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Downscale for performance
  canvas.width = 160;
  canvas.height = 100;

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  let edgeCount = 0;
  let brightnessSum = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const brightness = (r + g + b) / 3;
    brightnessSum += brightness;

    // crude edge detection
    if (brightness < 90 || brightness > 220) {
      edgeCount++;
    }
  }

  const edgeRatio = edgeCount / (data.length / 4);

  // 🔍 heuristics (tuned for Aadhaar-like cards)
  const tooSmall = edgeRatio < 0.08;
  const tooClose = edgeRatio > 0.35;
  const aligned = !tooSmall && !tooClose;

  setIsTooSmall(tooSmall);
  setIsTooClose(tooClose);
  setIsAligned(aligned);

  // 🟢 Stillness detection
  if (aligned) {
    if (!stillStartTime) {
      setStillStartTime(Date.now());
    } else if (Date.now() - stillStartTime > 1000) {
      capturePhoto(); // AUTO CAPTURE
      setStillStartTime(null);
    }
  } else {
    setStillStartTime(null);
  }
};

useEffect(() => {
  if (!isCameraActive) return;

  const interval = setInterval(analyzeFrame, 300);

  return () => clearInterval(interval);
}, [isCameraActive, captureMode, frontImage, backImage]);


  // Initialize camera
  const startCamera = async () => {
    if (stream) {
      // Camera already running, just ensure video element is connected
      if (videoRef.current && videoRef.current.srcObject !== stream) {
        videoRef.current.srcObject = stream;
        await videoRef.current
          .play()
          .catch((e) => console.log("Play error:", e));
      }
      return;
    }

    try {
      setCameraError(null);

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }

      setStream(mediaStream);
      setIsCameraActive(true);
      setUseFileUpload(false);
    } catch (err: any) {
      setIsCameraActive(false);
      setUseFileUpload(true);
      setCameraError("Unable to access camera. Please upload image.");
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
    setIsCameraActive(false);
  };

  // Capture photo
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL("image/png");

        if (captureMode === "front") {
          setFrontImage(imageData);
          setCaptureMode("back");
        } else {
          setBackImage(imageData);
          stopCamera();
        }
      }
    }
  };

  // Retake photo
  const retakePhoto = (mode: CaptureMode) => {
    if (mode === "front") {
      setFrontImage(null);
      setCaptureMode("front");
    } else {
      setBackImage(null);
      setCaptureMode("back");
    }

    // Don't stop camera if it's already running, just switch mode
    // The useEffect will handle camera state based on the new mode
    if (!isCameraActive) {
      startCamera();
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;

        if (captureMode === "front") {
          setFrontImage(imageData);
          setCaptureMode("back");
        } else {
          setBackImage(imageData);
        }
      };
      reader.readAsDataURL(file);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Trigger file upload
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  // Handle next
  const handleNext = async () => {
    if (!frontImage || !backImage) return;

    setIsLoading(true);
    setCameraError(null);

    try {
      const candidate_id = localStorage.getItem("candidate_id") || "";
      const candidate_name = localStorage.getItem("candidate_name") || "";

      const blob = await (await fetch(frontImage)).blob();
      const formData = new FormData();
      formData.append("file", blob, "aadhaar.jpg");
      formData.append("candidate_id", candidate_id);
      formData.append("candidate_name", candidate_name);

      const data = await postForm(
        "/auth/upload-aadhaar-card",
        formData,
      );
      if(!data.ok)(
        console.log(data.text,"fsdgfhgjh")
      )
      console.log(data, "aadhaar response");
      

      localStorage.setItem("isaadhaarcard", "true");

      onNext({
        frontImage,
        backImage,
        extractedData: data.extracted_fields,
      });
    }catch (err: any) {
  console.error("Aadhaar upload failed:", err);

  // Default fallback
  let message = "Aadhaar verification failed. Please try again.";

  // Our API utilities always throw Error with message
  if (err instanceof Error) {
    message = err.message;
  }

  setCameraError(message);
  toast.error(message);
}
 finally {
      setIsLoading(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Ensure video element gets the stream when it mounts
  useEffect(() => {
    if (stream && videoRef.current && isCameraActive) {
      if (videoRef.current.srcObject !== stream) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((e) => console.log("Play error:", e));
      }
    }
  }, [stream, isCameraActive, captureMode]);

  // Auto-start camera for current mode
  useEffect(() => {
    if (
      (captureMode === "front" && !frontImage) ||
      (captureMode === "back" && !backImage)
    ) {
      if (!isCameraActive && !useFileUpload) {
        startCamera();
      }
    }
  }, [captureMode, frontImage, backImage]);

  const canProceed = frontImage && backImage && !isLoading;


 function AadhaarFrameOverlay() {
  const borderColor = isAligned
    ? "border-green-500"
    : isTooSmall
    ? "border-yellow-400"
    : isTooClose
    ? "border-red-500"
    : "border-secondary";

  const message = isAligned
    ? "Perfect! Hold still…"
    : isTooSmall
    ? "Move closer"
    : isTooClose
    ? "Move farther"
    : "Align Aadhaar card inside the frame";

  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 bg-black/40" />

      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={`
            relative
            aspect-[1.6/1]
            w-[80%]
            max-w-[420px]
            border-2
            border-dashed
            ${borderColor}
            rounded-xl
            transition-colors duration-200
          `}
        >
          {/* Corners */}
          <span className={`absolute top-0 left-0 w-4 h-4 border-l-4 border-t-4 ${borderColor}`} />
          <span className={`absolute top-0 right-0 w-4 h-4 border-r-4 border-t-4 ${borderColor}`} />
          <span className={`absolute bottom-0 left-0 w-4 h-4 border-l-4 border-b-4 ${borderColor}`} />
          <span className={`absolute bottom-0 right-0 w-4 h-4 border-r-4 border-b-4 ${borderColor}`} />

          {/* Message */}
          <div className="absolute bottom-2 w-full text-center">
            <span className="text-xs bg-black/70 px-2 py-1 rounded text-white">
              {message}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}



  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        className="max-w-4xl w-full"
      >
        <div className="glass-card rounded-3xl p-10">
          {/* Header */}
          <motion.div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
              <CreditCard
                className="w-6 h-6 text-secondary"
                strokeWidth={1.5}
              />
            </div>
            <div>
              <h2 className="text-2xl">Aadhar Verification</h2>
              <p className="text-sm text-muted-foreground">
                Capture clear photos of your Aadhar card (front and back)
              </p>
            </div>
          </motion.div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-2 flex-1">
              <div
                className={`
                px-4 py-2 rounded-lg border transition-all
                ${
                  frontImage
                    ? "border-[var(--status-ready)] bg-[var(--status-ready)]/10 text-[var(--status-ready)]"
                    : captureMode === "front"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-muted/20 text-muted-foreground"
                }
              `}
              >
                {frontImage ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm">Front Captured</span>
                  </div>
                ) : (
                  <span className="text-sm">Front Side</span>
                )}
              </div>
            </div>

            <div className="w-8 h-0.5 bg-border" />

            <div className="flex items-center gap-2 flex-1">
              <div
                className={`
                px-4 py-2 rounded-lg border transition-all
                ${
                  backImage
                    ? "border-[var(--status-ready)] bg-[var(--status-ready)]/10 text-[var(--status-ready)]"
                    : captureMode === "back"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-muted/20 text-muted-foreground"
                }
              `}
              >
                {backImage ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm">Back Captured</span>
                  </div>
                ) : (
                  <span className="text-sm">Back Side</span>
                )}
              </div>
            </div>
          </div>

          {/* Camera Preview / Captured Images */}
          <div className="grid grid-cols-2 md:grid-cols-2 gap-6 mb-8">
            {/* Front Card */}
            <div className="space-y-4">
              <h3 className="text-sm text-muted-foreground">Front Side</h3>
              <div className="relative rounded-2xl overflow-hidden bg-muted/20 aspect-[1.6/1] border border-border">
                {frontImage ? (
                  <>
                    <img
                      src={frontImage}
                      alt="Aadhar Front"
                      className="w-full h-full object-cover"
                    />
                    <motion.button
                      onClick={() => retakePhoto("front")}
                      className="absolute bottom-4 right-4 p-2 rounded-lg bg-accent/90 backdrop-blur-sm border border-border hover:bg-accent transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </motion.button>
                  </>
                ) : captureMode === "front" && isCameraActive ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />

                    <AadhaarFrameOverlay />
                    {/* Scan line effect */}
                    {/* <div className="scan-line absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-secondary to-transparent opacity-50" /> */}
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <CreditCard
                        className="w-12 h-12 text-muted-foreground mx-auto mb-2"
                        strokeWidth={1}
                      />
                      <p className="text-xs text-muted-foreground">
                        Waiting to capture
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Back Card */}
            <div className="space-y-4">
              <h3 className="text-sm text-muted-foreground">Back Side</h3>
              <div className="relative rounded-2xl overflow-hidden bg-muted/20 aspect-[1.6/1] border border-border">
                {backImage ? (
                  <>
                    <img
                      src={backImage}
                      alt="Aadhar Back"
                      className="w-full h-full object-cover"
                    />
                    <motion.button
                      onClick={() => retakePhoto("back")}
                      className="absolute bottom-4 right-4 p-2 rounded-lg bg-accent/90 backdrop-blur-sm border border-border hover:bg-accent transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </motion.button>
                  </>
                ) : captureMode === "back" && isCameraActive ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    <AadhaarFrameOverlay />
                    {/* Scan line effect */}
                    {/* <div className="scan-line absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-secondary to-transparent opacity-50" /> */}
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <CreditCard
                        className="w-12 h-12 text-muted-foreground mx-auto mb-2"
                        strokeWidth={1}
                      />
                      <p className="text-xs text-muted-foreground">
                        {frontImage
                          ? "Waiting to capture"
                          : "Capture front first"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Hidden canvas for capturing */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Error Message */}
          <AnimatePresence>
            {cameraError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/30 flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-destructive mb-2">{cameraError}</p>
                  <button
                    onClick={() => {
                      setCameraError(null);
                      startCamera();
                    }}
                    className="text-xs text-primary hover:text-primary/80 transition-colors underline"
                  >
                    Try camera again
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Instructions */}
          <motion.div
            className="mb-6 p-4 rounded-xl bg-accent/30 border border-border"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-sm text-muted-foreground">
              <span className="text-primary">Tip:</span> Ensure the Aadhar card
              is clearly visible, well-lit, and all details are readable. Avoid
              glare and shadows.
            </p>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <AnimatePresence mode="wait">
              {isCameraActive &&
                ((captureMode === "front" && !frontImage) ||
                  (captureMode === "back" && !backImage)) && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={capturePhoto}
                    className="flex-1 px-6 py-4 bg-secondary text-secondary-foreground rounded-xl hover:shadow-lg hover:shadow-secondary/20 transition-all flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <Camera className="w-5 h-5" />
                    Capture {captureMode === "front" ? "Front" : "Back"}
                  </motion.button>
                )}

              {(useFileUpload || cameraError) &&
                ((captureMode === "front" && !frontImage) ||
                  (captureMode === "back" && !backImage)) && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={triggerFileUpload}
                    className="flex-1 px-6 py-4 bg-accent border border-border text-foreground rounded-xl hover:bg-accent/80 transition-all flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <Upload className="w-5 h-5" />
                    Upload {captureMode === "front" ? "Front" : "Back"}
                  </motion.button>
                )}
            </AnimatePresence>

            <motion.button
  onClick={handleNext}
  disabled={!canProceed}
  className={`
    flex-1 px-6 py-4 rounded-xl transition-all
    flex items-center justify-center gap-2
    ${
      canProceed
        ? "bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/20"
        : "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
    }
  `}
  whileHover={canProceed ? { scale: 1.01 } : {}}
  whileTap={canProceed ? { scale: 0.99 } : {}}
>
  {isLoading ? (
    <>
      <RefreshCw className="w-5 h-5 animate-spin" />
      Verifying Aadhaar…
    </>
  ) : canProceed ? (
    "Continue"
  ) : (
    "Capture both sides to continue"
  )}
</motion.button>

          </div>
        </div>
      </motion.div>
    </div>
  );
}
