import { useState, useEffect, useRef } from "react";

interface Step4PhotoCaptureProps {
  cameraStream: MediaStream;
  onNext: (photo: string) => void;
}

export function Step4PhotoCapture({ cameraStream, onNext }: Step4PhotoCaptureProps) {
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [status, setStatus] = useState("🔵 Align your face within the oval");
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
        setStatus("🔵 Hold still — ready to capture");
        setStatusOk(false);
      } catch {
        setStatus("⚠️ Camera access denied — please allow camera");
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
    setStatus("✅ Face captured — you're good to go!");
    setStatusOk(true);

    setTimeout(() => setIsCapturing(false), 350);
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    setStatus("🔵 Hold still — ready to capture");
    setStatusOk(false);

    requestAnimationFrame(() => {
      videoRef.current?.play().catch(() => {});
    });
  };

  const handleContinue = () => {
    if (capturedPhoto) onNext(capturedPhoto);
  };

  return (
    <div className="pai-card">
      <div className="face-step-card">
        <div className="progress-wrap">
          <div className="progress-label">
            <span>Step 5 of 10</span>
            <span>Face Verification</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: "50%" }} />
          </div>
        </div>

        <div className="face-wrap">
          <div className={`face-oval${capturedPhoto ? " face-ok" : ""}`}>
            <video ref={videoRef} autoPlay muted playsInline className={capturedPhoto ? "face-video-hidden" : ""} />
            {capturedPhoto && <img src={capturedPhoto} alt="Captured face preview" className="face-captured-img" />}
          </div>
          <div className={`face-status${statusOk ? " ok" : ""}`}>{status}</div>

          <div className="face-guide">
            <div className="face-guide-item">
              <span className="fg-icon">💡</span>Good lighting
            </div>
            <div className="face-guide-item">
              <span className="fg-icon">🚫</span>No glasses glare
            </div>
            <div className="face-guide-item">
              <span className="fg-icon">😐</span>Neutral expression
            </div>
            <div className="face-guide-item">
              <span className="fg-icon">📷</span>Face the camera
            </div>
          </div>
        </div>

        <button
          className="btn-pai btn-pai-primary"
          disabled={isCapturing}
          onClick={capturedPhoto ? handleContinue : handleCapturePhoto}
        >
          {!capturedPhoto ? (isCapturing ? "Capturing..." : "Capture Photo →") : "Face Verified ✓ Continue →"}
        </button>

        <button className="btn-pai btn-pai-ghost" style={{ marginTop: 10 }} onClick={handleRetake}>
          🔄 Retry Camera
        </button>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
