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
  onNext: (data: AadharData | null) => void;
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
  
    canvas.width = 320;
    canvas.height = 200;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const W = canvas.width;
    const H = canvas.height;
  
    // Step 1: Grayscale
    const gray = new Uint8Array(W * H);
    for (let i = 0; i < gray.length; i++) {
      gray[i] = data[i * 4] * 0.299 + data[i * 4 + 1] * 0.587 + data[i * 4 + 2] * 0.114;
    }
  
    // Step 2: Edge detection
    let horizontalEdges = 0;
    let verticalEdges = 0;
    for (let y = 1; y < H - 1; y++) {
      for (let x = 1; x < W - 1; x++) {
        const idx = y * W + x;
        if (Math.abs(gray[idx + 1] - gray[idx - 1]) > 30) horizontalEdges++;
        if (Math.abs(gray[idx + W] - gray[idx - W]) > 30) verticalEdges++;
      }
    }
  
    const totalPixels = W * H;
    const hRatio = horizontalEdges / totalPixels;
    const vRatio = verticalEdges / totalPixels;
  
    // Step 3: Center region brightness + skin detection
    const cx = Math.floor(W / 2);
    const cy = Math.floor(H / 2);
    const sampleSize = 20;
    const centerBrightness: number[] = [];
    let skinPixels = 0;
  
    for (let y = cy - sampleSize; y < cy + sampleSize; y++) {
      for (let x = cx - sampleSize; x < cx + sampleSize; x++) {
        centerBrightness.push(gray[y * W + x]);
  
        // ✅ Skin color detection: R high > G > B pattern
        const idx = (y * W + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        if (
          r > 95 && g > 40 && b > 20 &&
          r > g && r > b &&
          Math.abs(r - g) > 15
        ) {
          skinPixels++;
        }
      }
    }
  
    const totalSamplePixels = centerBrightness.length;
    const skinRatio = skinPixels / totalSamplePixels;
    const isSkin = skinRatio > 0.35; // 35%+ skin pixels = face hai, reject karo
  
    const avg = centerBrightness.reduce((a, b) => a + b, 0) / centerBrightness.length;
    const centerVariance =
      centerBrightness.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / centerBrightness.length;
  
    // Step 4: Card detection — flat surface + no skin + balanced edges
    const isCardLike = centerVariance < 1200 && !isSkin;
    const hasGoodEdgeBalance =
      Math.max(hRatio, vRatio) > 0
        ? Math.min(hRatio, vRatio) / Math.max(hRatio, vRatio) > 0.3
        : false;
    const tooSmall = hRatio < 0.03 && vRatio < 0.03;
    const tooClose = hRatio > 0.25 || vRatio > 0.25;
  
    const aligned = isCardLike && hasGoodEdgeBalance && !tooSmall && !tooClose;
  
    setIsTooSmall(tooSmall);
    setIsTooClose(tooClose);
    setIsAligned(aligned);
  
    // Step 5: Auto capture — sirf card detect hone par
    if (aligned) {
      if (!stillStartTime) {
        setStillStartTime(Date.now());
      } else if (Date.now() - stillStartTime > 1500) {
        capturePhoto();
        setStillStartTime(null);
      }
    } else {
      setStillStartTime(null);
    }
  };

  // useEffect(() => {
  //   if (!isCameraActive) return;
  //   const interval = setInterval(analyzeFrame, 300);
  //   return () => clearInterval(interval);
  // }, [isCameraActive, captureMode, frontImage, backImage]);
  useEffect(() => {
    if (!isCameraActive) return;
    const interval = setInterval(analyzeFrame, 300);
    return () => clearInterval(interval);
  }, [isCameraActive, captureMode, frontImage, backImage, stillStartTime]); // ✅ stillStartTime add kiya
  const startCamera = async () => {
    // ✅ Stream exist karta hai to video re-attach karo, early return mat karo
    if (stream) {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch((e) => console.log("Play error:", e));
        setIsCameraActive(true); // ✅ ensure active state
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
  // const startCamera = async () => {
  //   if (stream) {
  //     if (videoRef.current && videoRef.current.srcObject !== stream) {
  //       videoRef.current.srcObject = stream;
  //       await videoRef.current.play().catch((e) => console.log("Play error:", e));
  //     }
  //     return;
  //   }

  //   try {
  //     setCameraError(null);
  //     const mediaStream = await navigator.mediaDevices.getUserMedia({
  //       video: { facingMode: "environment" },
  //     });

  //     if (videoRef.current) {
  //       videoRef.current.srcObject = mediaStream;
  //       await videoRef.current.play();
  //     }

  //     setStream(mediaStream);
  //     setIsCameraActive(true);
  //     setUseFileUpload(false);
  //   } catch (err: any) {
  //     setIsCameraActive(false);
  //     setUseFileUpload(true);
  //     setCameraError("Unable to access camera. Please upload image.");
  //   }
  // };

  const stopCamera = () => {
    if (videoRef.current) videoRef.current.srcObject = null;
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
    setIsCameraActive(false);
  };

  const handleSkip = () => {
    localStorage.setItem("isaadhaarcard", "false");
    onNext(null);
  };

  // const capturePhoto = () => {
  //   if (videoRef.current && canvasRef.current) {
  //     const video = videoRef.current;
  //     const canvas = canvasRef.current;
  //     canvas.width = video.videoWidth;
  //     canvas.height = video.videoHeight;
  //     const context = canvas.getContext("2d");
  //     if (context) {
  //       context.drawImage(video, 0, 0, canvas.width, canvas.height);
  //       const imageData = canvas.toDataURL("image/png");
  //       if (captureMode === "front") {
  //         setFrontImage(imageData);
  //         setCaptureMode("back");
  //       } else {
  //         setBackImage(imageData);
  //         stopCamera();
  //       }
  //     }
  //   }
  // };
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
          setStillStartTime(null); // ✅ Fix 3: reset timer
          setCaptureMode("back");
          // ✅ Fix 1: re-attach stream after React re-renders
          setTimeout(() => {
            if (videoRef.current && stream) {
              videoRef.current.srcObject = stream;
              videoRef.current.play().catch(() => {});
            }
          }, 100);
        } else {
          setBackImage(imageData);
          stopCamera();
        }
      }
    }
  };
  const retakePhoto = (mode: CaptureMode) => {
    if (mode === "front") {
      setFrontImage(null);
      setCaptureMode("front");
    } else {
      setBackImage(null);
      setCaptureMode("back");
    }
    if (!isCameraActive) startCamera();
  };


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
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const triggerFileUpload = () => fileInputRef.current?.click();

  const handleNext = async () => {
    if (!frontImage || !backImage) {
      localStorage.setItem("isaadhaarcard", "false");
      onNext(null);
      return;
    }

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

      const data = await postForm("/auth/upload-aadhaar-card", formData);
      localStorage.setItem("isaadhaarcard", "true");
      onNext({ frontImage, backImage, extractedData: data.extracted_fields });
    } catch (err: any) {
      const message =
        err instanceof Error
          ? err.message
          : "Aadhaar verification failed. Please try again.";
      setCameraError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => { stopCamera(); };
  }, []);

  useEffect(() => {
    if (stream && videoRef.current && isCameraActive) {
      if (videoRef.current.srcObject !== stream) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((e) => console.log("Play error:", e));
      }
    }
  }, [stream, isCameraActive, captureMode]);

  useEffect(() => {
    if (
      (captureMode === "front" && !frontImage) ||
      (captureMode === "back" && !backImage)
    ) {
      if (!isCameraActive && !useFileUpload) startCamera();
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
          : "border-white/40";

          const message = isAligned
          ? "Card detected! Hold still…"
          : isTooSmall
            ? "Move closer to the card"
            : isTooClose
              ? "Move farther from the card"
              : "Place Aadhaar card inside the frame";

    return (
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={`relative aspect-[1.6/1] w-[80%] max-w-[420px] border-2 border-dashed ${borderColor} rounded-xl transition-colors duration-200`}
          >
            <span className={`absolute top-0 left-0 w-4 h-4 border-l-4 border-t-4 ${borderColor}`} />
            <span className={`absolute top-0 right-0 w-4 h-4 border-r-4 border-t-4 ${borderColor}`} />
            <span className={`absolute bottom-0 left-0 w-4 h-4 border-l-4 border-b-4 ${borderColor}`} />
            <span className={`absolute bottom-0 right-0 w-4 h-4 border-r-4 border-b-4 ${borderColor}`} />
            <div className="absolute bottom-2 w-full text-center">
              <span className="text-xs bg-black/70 px-2 py-1 rounded text-white">{message}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    // <div className="min-h-screen flex items-center justify-center p-6">
      <div className="min-h-screen flex items-center justify-center p-6 pb-16 pt-14">
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full max-w-[52rem]"
      >
        {/* ✅ Same glass card as StepJDConsent */}
        <div className="rounded-3xl border border-white/10 bg-[rgba(20,22,30,0.85)] p-8 md:p-10 shadow-2xl backdrop-blur-sm">

          {/* Header */}
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/30 bg-primary/10">
              <CreditCard className="h-5 w-5 text-primary" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Aadhaar Verification</h2>
              <p className="text-sm text-muted-foreground">
                Capture clear photos of your Aaadhaar card (front and back)
              </p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="mb-6 flex items-center gap-3">
            <div
              className={`flex flex-1 items-center gap-2 rounded-xl border px-4 py-2 transition-all ${
                frontImage
                  ? "border-green-500/40 bg-green-500/10 text-green-400"
                  : captureMode === "front"
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-white/10 bg-white/[0.02] text-muted-foreground"
              }`}
            >
              {frontImage ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm">Front Captured</span>
                </>
              ) : (
                <span className="text-sm">Front Side</span>
              )}
            </div>

            <div className="h-px w-6 bg-white/10" />

            <div
              className={`flex flex-1 items-center gap-2 rounded-xl border px-4 py-2 transition-all ${
                backImage
                  ? "border-green-500/40 bg-green-500/10 text-green-400"
                  : captureMode === "back"
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-white/10 bg-white/[0.02] text-muted-foreground"
              }`}
            >
              {backImage ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm">Back Captured</span>
                </>
              ) : (
                <span className="text-sm">Back Side</span>
              )}
            </div>
          </div>

          {/* Camera Preview / Captured Images */}
          <div className="mb-6 grid grid-cols-2 gap-4">
            {/* Front Card */}
            <div className="space-y-2">
              <h3 className="text-xs text-muted-foreground">Front Side</h3>
              <div className="relative aspect-[1.6/1] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
                {frontImage ? (
                  <>
                    <img src={frontImage} alt="Aadhar Front" className="h-full w-full object-cover" />
                    <motion.button
                      onClick={() => retakePhoto("front")}
                      className="absolute bottom-3 right-3 rounded-lg border border-white/20 bg-black/60 p-2 backdrop-blur-sm transition-colors hover:bg-black/80"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </motion.button>
                  </>
                ) : captureMode === "front" && isCameraActive ? (
                  <div className="absolute inset-0">
                    <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
                    <AadhaarFrameOverlay />
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <CreditCard className="mx-auto mb-2 h-10 w-10 text-muted-foreground" strokeWidth={1} />
                      <p className="text-xs text-muted-foreground">Waiting to capture</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Back Card */}
            <div className="space-y-2">
              <h3 className="text-xs text-muted-foreground">Back Side</h3>
              <div className="relative aspect-[1.6/1] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
                {backImage ? (
                  <>
                    <img src={backImage} alt="Aadhar Back" className="h-full w-full object-cover" />
                    <motion.button
                      onClick={() => retakePhoto("back")}
                      className="absolute bottom-3 right-3 rounded-lg border border-white/20 bg-black/60 p-2 backdrop-blur-sm transition-colors hover:bg-black/80"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </motion.button>
                  </>
                ) : captureMode === "back" && isCameraActive ? (
                  <div className="absolute inset-0">
                    <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
                    <AadhaarFrameOverlay />
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <CreditCard className="mx-auto mb-2 h-10 w-10 text-muted-foreground" strokeWidth={1} />
                      <p className="text-xs text-muted-foreground">
                        {frontImage ? "Waiting to capture" : "Capture front first"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Hidden elements */}
          <canvas ref={canvasRef} className="hidden" />
          <canvas ref={analysisCanvasRef} className="hidden" />
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />

          {/* Error Message */}
          {/* <AnimatePresence>
            {cameraError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4"
              >
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
                <div className="flex-1">
                  <p className="mb-1.5 text-sm text-red-400">{cameraError}</p>
                  <button
                    onClick={() => { setCameraError(null); startCamera(); }}
                    className="text-xs text-primary underline transition-colors hover:text-primary/80"
                  >
                    Try camera again
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence> */}

          {/* Tip */}
          <div className="mb-5 rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <p className="text-sm text-muted-foreground">
              <span className="text-primary font-medium">Tip:</span> Ensure the Aadhaar card is clearly visible,
              well-lit, and all details are readable. Avoid glare and shadows.
            </p>
          </div>

          {/* Action Buttons */}
          {/* Action Buttons */}
{/* Action Buttons */}
{/* Action Buttons */}
{/* Action Buttons */}
<div className="flex justify-center gap-3">
  <motion.button
    onClick={handleSkip}
    className="rounded-xl border border-white/20 px-8 py-3 text-sm text-muted-foreground transition-colors hover:bg-white/5 whitespace-nowrap"
    whileHover={{ scale: 1.01 }}
    whileTap={{ scale: 0.99 }}
  >
    Skip for now
  </motion.button>

  <AnimatePresence mode="wait">
    {isCameraActive &&
      ((captureMode === "front" && !frontImage) ||
        (captureMode === "back" && !backImage)) && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          onClick={capturePhoto}
          className="flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/20 whitespace-nowrap"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <Camera className="h-4 w-4" />
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
          className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/[0.03] px-8 py-3 text-sm text-foreground transition-all hover:bg-white/[0.06] whitespace-nowrap"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <Upload className="h-4 w-4" />
          Upload {captureMode === "front" ? "Front" : "Back"}
        </motion.button>
      )}

    {canProceed && (
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        onClick={handleNext}
        className="flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/20 whitespace-nowrap"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        {isLoading ? (
          <>
            <RefreshCw className="h-4 w-4 animate-spin" />
            Verifying…
          </>
        ) : (
          "Continue →"
        )}
      </motion.button>
    )}
  </AnimatePresence>
</div>
          {/* <div className="flex gap-3">
            <AnimatePresence mode="wait">
              {isCameraActive &&
                ((captureMode === "front" && !frontImage) ||
                  (captureMode === "back" && !backImage)) && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={capturePhoto}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/20"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <Camera className="h-4 w-4" />
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
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/[0.03] px-5 py-3 text-foreground transition-all hover:bg-white/[0.06]"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <Upload className="h-4 w-4" />
                    Upload {captureMode === "front" ? "Front" : "Back"}
                  </motion.button>
                )}
            </AnimatePresence>

            <motion.button
              onClick={handleSkip}
              className="flex flex-1 items-center justify-center rounded-xl border border-white/20 px-5 py-3 text-muted-foreground transition-colors hover:bg-white/5"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              Skip for now
            </motion.button>

            <motion.button
              onClick={handleNext}
              disabled={!canProceed}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 transition-all ${
                canProceed
                  ? "bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/20"
                  : "cursor-not-allowed bg-primary/50 text-primary-foreground/50"
              }`}
              whileHover={canProceed ? { scale: 1.01 } : {}}
              whileTap={canProceed ? { scale: 0.99 } : {}}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Verifying…
                </>
              ) : canProceed ? (
                "Continue →"
              ) : (
                "Capture both sides"
              )}
            </motion.button>
          </div> */}
        </div>
      </motion.div>
    </div>
  );
}