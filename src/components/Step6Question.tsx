import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Brain,
  Clock,
  Mic,
  MicOff,
  Video,
  AlertTriangle,
  Eye,
  Monitor,
  Loader2,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { useSpeakQuestion } from "../hooks/useSpeakQuestion";
import { JarvisQuestionBox } from "../utils/jarvicevoiceorb";

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const QUESTION_TIME_LIMIT = 90;

interface Step6QuestionProps {
  questionNumber: number;
  totalQuestions: number;
  question: QuestionData;
  onAnswer: (payload: { questionId: string; transcript: string; timeSpent: number }) => void;
  systemReady: boolean;
  cameraStream: MediaStream;
  screenStream: MediaStream;
}

export interface QuestionData {
  id: string;
  text: string;
  type: "multiple-choice" | "open-ended";
  expected_answer?: string;
  options?: string[];
}

export function Step6Question({
  questionNumber,
  totalQuestions,
  question,
  onAnswer,
  systemReady,
  cameraStream,
  screenStream,
}: Step6QuestionProps) {
  const [isSpeaking, setIsSpeaking]         = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [isRecording, setIsRecording]       = useState(false);
  const [timeLeft, setTimeLeft]             = useState(QUESTION_TIME_LIMIT);
  const [showTabAlert, setShowTabAlert]     = useState(false);
  const [isSubmitting, setIsSubmitting]     = useState(false);
  const [submitLabel, setSubmitLabel]       = useState<string | null>(null);
  const [transcript, setTranscript]         = useState("");
  const [showTranscript, setShowTranscript] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const videoRef         = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef   = useRef<Blob[]>([]);
  const audioBlobRef     = useRef<Blob | null>(null);
  const audioRef         = useRef<HTMLAudioElement | null>(null);
  const autoSubmittedRef  = useRef(false);
  const timeSpentRef      = useRef(0);
  const isMountedRef      = useRef(true);
  const isLastQuestionRef = useRef(questionNumber === totalQuestions);

  const HEAD_POSE_INTERVAL = Number(import.meta.env.VITE_HEAD_POSE_INTERVAL_MS) || 5000;
  const isLastQuestion     = questionNumber === totalQuestions;
  const cleanQuestionText  = question.text.replace(/<[^>]*>/g, "").trim();

  isLastQuestionRef.current = isLastQuestion;

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  // ── countdown ────────────────────────────────────────────────────────────────
  useEffect(() => {
    setTimeLeft(QUESTION_TIME_LIMIT);
    autoSubmittedRef.current = false;
    timeSpentRef.current = 0;
    const id = setInterval(() => {
      setTimeLeft((prev) => {
        timeSpentRef.current = QUESTION_TIME_LIMIT - prev + 1;
        if (prev <= 1) { clearInterval(id); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [question.id]);

  useEffect(() => {
    if (timeLeft === 0 && !autoSubmittedRef.current && !isSubmitting) {
      autoSubmittedRef.current = true;
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
      toast.success("Time's up! Auto-submitting…");
      handleFinalSubmit(true);
    }
  }, [timeLeft]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const timerColor =
    timeLeft > 30 ? "text-foreground" :
    timeLeft > 10 ? "text-yellow-400" : "text-red-500";
  const timerPulse = timeLeft <= 10 && timeLeft > 0;

  // ── reset on question change ──────────────────────────────────────────────────
  useEffect(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    setSelectedAnswer(""); setTranscript(""); setShowTranscript(false);
    setIsRecording(false); setIsSubmitting(false); setSubmitLabel(null);
    setIsTranscribing(false);
    audioBlobRef.current = null; audioChunksRef.current = [];
  }, [question.id]);

  useEffect(() => {
    return () => {
      const a = audioRef.current;
      if (a) {
        a.onended = null;
        a.onerror = null;
        a.pause();
        a.src = "";
        audioRef.current = null;
      }
      setIsSpeaking(false);
    };
  }, [question.id]);

  // ── camera ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch(() => {});
    }
  }, [cameraStream]);

  const captureFrame = (): Promise<Blob | null> =>
    new Promise((resolve) => {
      if (!videoRef.current) return resolve(null);
      const v = videoRef.current;
      const c = document.createElement("canvas");
      c.width = v.videoWidth; c.height = v.videoHeight;
      const ctx = c.getContext("2d");
      if (!ctx) return resolve(null);
      ctx.drawImage(v, 0, 0, c.width, c.height);
      c.toBlob((b) => resolve(b), "image/jpeg", 0.7);
    });

  // ── tab switch guard ──────────────────────────────────────────────────────────
  // useEffect(() => {
  //   const fn = () => {
  //     if (!document.hidden) return;

  //     // ✅ UI turant update
  //     setShowTabAlert(true);
  //     setTimeout(() => setShowTabAlert(false), 4000);

  //     // ✅ sendBeacon — browser guaranteed turant bhejta hai, tab switch/close pe bhi kaam karta hai
  //     const fd = new FormData();
  //     fd.append("candidate_id", localStorage.getItem("candidate_id") || "");
  //     fd.append("reason", "User switched tabs");
  //     fd.append("timestamp", new Date().toISOString());

  //     const sent = navigator.sendBeacon(`${API_BASE}/frames/log_tab_violation`, fd);

  //     // Fallback: agar sendBeacon na chale toh fire-and-forget fetch
  //     if (!sent) {
  //       fetch(`${API_BASE}/frames/log_tab_violation`, { method: "POST", body: fd }).catch(() => {});
  //     }
  //   };
  //   document.addEventListener("visibilitychange", fn);
  //   return () => document.removeEventListener("visibilitychange", fn);
  // }, []);
  useEffect(() => {

    const logViolation = () => {
      setShowTabAlert(true);
      setTimeout(() => setShowTabAlert(false), 4000);
  
      const fd = new FormData();
      fd.append("candidate_id", localStorage.getItem("candidate_id") || "");
      fd.append("reason", "Tab switch detected");
      fd.append("timestamp", new Date().toISOString());
  
      navigator.sendBeacon(`${API_BASE}/frames/log_tab_violation`, fd);
    };
  
    // ✅ tab change
    const onVisibility = () => {
      if (document.hidden) {
        logViolation();
      }
    };
  
    // ✅ window blur (instant)
    const onBlur = () => {
      logViolation();
    };
  
    // ✅ window focus lost
    const onFocusOut = () => {
      logViolation();
    };
  
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focusout", onFocusOut);
  
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focusout", onFocusOut);
    };
  
  }, []);
  // ── head pose ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!cameraStream || !videoRef.current) return;
    const id = window.setInterval(async () => {
      try {
        const blob = await captureFrame();
        if (!blob) return;
        const fd = new FormData();
        fd.append("file", blob, "frame.jpg");
        fd.append("candidate_name", localStorage.getItem("candidate_id") || "");
        fd.append("session_id", localStorage.getItem("session_id") || "");
        const { data } = await axios.post(`${API_BASE}/status/detect_head_pose`, fd, { validateStatus: () => true });
        if (data?.data?.cheating === true) toast.error(data?.message || "Cheating detected");
        else if (data?.message && data?.status_code !== 200) toast.error(data.message);
      } catch {}
    }, HEAD_POSE_INTERVAL);
    return () => clearInterval(id);
  }, [cameraStream]);

  useEffect(() => {
    document.body.classList.toggle("recording-active", screenStream?.active);
    return () => document.body.classList.remove("recording-active");
  }, [screenStream]);

  // ── recording ────────────────────────────────────────────────────────────────
  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      setTranscript(""); setShowTranscript(false); audioBlobRef.current = null; setSelectedAnswer("");
      const stream   = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        audioBlobRef.current = blob;
        await transcribeAudio(blob);
      };
      recorder.start(); mediaRecorderRef.current = recorder; setIsRecording(true);
    }
  };

  const transcribeAudio = async (blob: Blob) => {
    setIsTranscribing(true);
    try {
      const fd = new FormData();
      fd.append("candidate_id", localStorage.getItem("candidate_id") || "");
      fd.append("question_id", question.id);
      fd.append("question", question.text);
      fd.append("expected_answer", question.expected_answer || "");
      fd.append("audio_file", new File([blob], `stt_${question.id}.webm`, { type: "audio/webm" }));
      const res  = await fetch(`${API_BASE}/questions/stt_only`, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Transcription failed");
      if (isMountedRef.current) { setTranscript(data?.user_answer || ""); setShowTranscript(true); }
      toast.success("Transcription completed!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to transcribe audio");
    } finally {
      if (isMountedRef.current) setIsTranscribing(false);
    }
  };

  // ── submit ───────────────────────────────────────────────────────────────────
  const handleFinalSubmit = async (autoSubmit = false) => {
    if (isSubmitting) return;
    const lastQ = isLastQuestionRef.current;
    setIsSubmitting(true);
    setSubmitLabel(lastQ ? "Completing…" : "Submitting…");
    try {
      const cid = localStorage.getItem("candidate_id") || "";
      const sid = localStorage.getItem("session_id")   || "";
      if (!lastQ) {
        const fd = new FormData();
        fd.append("candidate_id", cid); fd.append("question_id", question.id);
        fd.append("question", question.text); fd.append("session_id", sid);
        if (audioBlobRef.current)
          fd.append("audio_file", new File([audioBlobRef.current], `answer_${question.id}.webm`, { type: "audio/webm" }));
        const res = await fetch(`${API_BASE}/questions/submit_answer`, { method: "POST", body: fd });
        if (!res.ok) throw new Error("Failed to submit answer");
        onAnswer({ questionId: question.id, transcript: transcript || "", timeSpent: timeSpentRef.current });
        return;
      }
      const hasAnswer =
        (question.type === "multiple-choice" && selectedAnswer) ||
        (question.type === "open-ended" && showTranscript);
      if (hasAnswer) {
        const fd = new FormData();
        fd.append("candidate_id", cid); fd.append("question_id", question.id);
        fd.append("question", question.text); fd.append("session_id", sid);
        if (audioBlobRef.current)
          fd.append("audio_file", new File([audioBlobRef.current], `answer_${question.id}.webm`, { type: "audio/webm" }));
        const r = await fetch(`${API_BASE}/questions/submit_answer`, { method: "POST", body: fd });
        if (!r.ok) throw new Error("Failed to submit last answer");
      } else {
        const fd = new FormData();
        fd.append("candidate_id", cid); fd.append("question_id", question.id); fd.append("question", question.text);
        const r = await fetch(`${API_BASE}/questions/skip_question`, { method: "POST", body: fd });
        if (!r.ok) throw new Error("Failed to skip last question");
      }
      const params = new URLSearchParams(); params.append("candidate_id", cid);
      const endRes = await fetch(`${API_BASE}/questions/end-test`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", accept: "application/json" },
        body: params.toString(),
      });
      const endData = await endRes.json();
      if (!endRes.ok) throw new Error(endData?.message || "Failed to complete interview");
      onAnswer({ questionId: question.id, transcript: transcript || "", timeSpent: timeSpentRef.current });
    } catch (err: any) {
      toast.error(err?.message || "Something went wrong");
      if (isMountedRef.current) { setIsSubmitting(false); setSubmitLabel(null); }
    }
  };

  // ── skip ─────────────────────────────────────────────────────────────────────
  const handleSkip = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitLabel("Skipping…");
    try {
      const fd = new FormData();
      fd.append("candidate_id", localStorage.getItem("candidate_id") || "");
      fd.append("question_id", question.id); fd.append("question", question.text);
      const { data } = await axios.post(`${API_BASE}/questions/skip_question`, fd, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      onAnswer({ questionId: question.id, transcript: "", timeSpent: timeSpentRef.current });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Could not skip question");
      if (isMountedRef.current) { setIsSubmitting(false); setSubmitLabel(null); }
    }
  };

  const handleRetake = () => {
    audioBlobRef.current = null; setTranscript(""); setShowTranscript(false); setSelectedAnswer("");
  };

  // ── speak ────────────────────────────────────────────────────────────────────
  const speakQuestion = useCallback(async () => {
    if (isRecording || isSpeaking) return;
    if (audioRef.current) {
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    try {
      setIsSpeaking(true);
      const res  = await fetch(`${API_BASE}/questions/${question.id}/speak`, { method: "POST" });
      const data = await res.json();
      if (!data?.audio_url) throw new Error("Audio URL missing");
      const audio = new Audio();
      audio.onended = () => { if (isMountedRef.current) setIsSpeaking(false); };
      audio.onerror = () => {
        if (audioRef.current === audio && isMountedRef.current) {
          setIsSpeaking(false);
          toast.error("Audio playback failed");
        }
      };
      audio.src = data.audio_url;
      audioRef.current = audio;
      await audio.play();
    } catch (err: any) {
      if (isMountedRef.current) {
        setIsSpeaking(false);
        toast.error(err?.message || "Could not play question audio");
      }
    }
  }, [question.id, isRecording, isSpeaking]);

  useEffect(() => {
    const t = setTimeout(() => speakQuestion(), 200);
    return () => clearTimeout(t);
  }, [question.id]);

  const progress = (questionNumber / totalQuestions) * 100;
  const defaultSubmitLabel = isLastQuestion ? "Complete Interview" : "Submit Answer";

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">

      {/* Tab Alert */}
      <AnimatePresence>
        {showTabAlert && (
          <motion.div
            initial={{ opacity: 0, y: -100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -100 }}
            className="fixed top-1/4 left-1/2 -translate-x-1/2 z-[60] glass-card border-2 border-destructive rounded-2xl px-6 py-4 shadow-2xl shadow-destructive/50"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-destructive" strokeWidth={2} />
              </div>
              <div>
                <p className="font-medium text-destructive">Warning: Tab Switch Detected!</p>
                <p className="text-xs text-muted-foreground">This activity has been recorded</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Top Bar ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 glass-card border-b border-border z-50"
      >
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <motion.div className="w-3 h-3 rounded-full bg-destructive"
                animate={{ opacity: [1, 0.3, 1], scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} />
              <span className="text-sm font-medium text-destructive">REC</span>
            </div>
            <div className="flex items-center gap-3">
              {[{ icon: Video, label: "Camera" }, { icon: Monitor, label: "Screen" }, { icon: Eye, label: "Monitoring" }].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                  <Icon className="w-3.5 h-3.5 text-primary" strokeWidth={2} />
                  <span className="text-xs text-primary">{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className={`w-4 h-4 transition-colors duration-300 ${timerColor}`} strokeWidth={1.5} />
            <motion.span
              key={timeLeft}
              className={`font-mono text-xl font-semibold tracking-wider tabular-nums transition-colors duration-300 ${timerColor}`}
              animate={timerPulse ? { scale: [1, 1.15, 1] } : {}}
              transition={{ duration: 0.4 }}
            >
              {formatTime(timeLeft)}
            </motion.span>
          </div>
        </div>
        <div className="h-0.5 w-full bg-white/5">
          <motion.div
            className={`h-full transition-colors duration-300 ${
              timeLeft > 30 ? "bg-primary" : timeLeft > 10 ? "bg-yellow-400" : "bg-red-500"
            }`}
            animate={{ width: `${(timeLeft / QUESTION_TIME_LIMIT) * 100}%` }}
            transition={{ duration: 1, ease: "linear" }}
          />
        </div>
      </motion.div>

      {/* ── Main Layout ── */}
      <div className="flex h-screen pt-[64px] pl-14 overflow-hidden">

        {/* LEFT: Camera — locked, no scroll */}
        {/* <motion.div
          initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}
        //   className="w-[40%] flex-shrink-0 p-4 border-r border-border flex flex-col gap-3 h-full justify-center overflow-hidden"
        // >
          className="w-[40%] flex-shrink-0 p-4 border-r border-border flex flex-col gap-3 h-full overflow-hidden"> */}
          <motion.div
  initial={{ opacity: 0, x: -50 }}
  animate={{ opacity: 1, x: 0 }}
  className="w-[40%] flex-shrink-0 p-4 border-r border-border flex flex-col gap-4 h-full"
>
          {/* <div className="glass-card rounded-2xl overflow-hidden relative border border-border" style={{ height: "58%" }}> */}
          <div className="glass-card rounded-2xl overflow-hidden relative border border-border flex-1">
            <video ref={videoRef} autoPlay playsInline muted
              className="absolute inset-0 w-full h-full object-cover -scale-x-100" />
            <div className="scan-line absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 pointer-events-none" />
            <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-lg glass-card border border-border">
              <motion.div className="w-2 h-2 rounded-full bg-[var(--status-ready)]"
                animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
              <span className="text-xs">Live</span>
            </div>
            <motion.div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none"
              animate={{ opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
          </div>

          {/* <div className="glass-card rounded-xl p-4 border border-border flex-shrink-0"> */}
          <div className="glass-card rounded-xl p-3 border border-border flex-shrink-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Brain className="w-4 h-4 text-primary" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Progress</p>
                <p className="text-sm font-medium">Question {questionNumber} of {totalQuestions}</p>
              </div>
            </div>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div className="h-full bg-gradient-to-r from-primary to-secondary"
                initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
            </div>
          </div>

          <div className="glass-card rounded-xl p-3 border border-border flex-shrink-0">
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
              <p>Please stay in frame and avoid switching tabs during the interview</p>
            </div>
          </div>
        </motion.div>

        {/* RIGHT: PAI Box + Answer
            ✅ KEY FIX:
            - Removed h-full and justify-center from inner div
            - overflow-y-auto on the panel itself
            - py-6 pb-10 on inner div so Skip button never clips
        */}
        <motion.div
          initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}
          className="w-[60%] flex-shrink-0 overflow-y-auto"
        >
          <div className="max-w-xl mx-auto px-4 py-6 pb-10 flex flex-col gap-4">

            <JarvisQuestionBox
              questionText={cleanQuestionText}
              isSpeaking={isSpeaking}
              onSpeak={speakQuestion}
              disabled={isRecording}
              questionKey={question.id}
            />

            <motion.div
              key={question.id + "-answer"}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="glass-card rounded-2xl p-6 border border-border"
            >
              {/* Multiple Choice */}
              {question.type === "multiple-choice" && question.options && (
                <div className="space-y-3 mb-6">
                  {question.options.map((option, index) => {
                    const isSelected = selectedAnswer === option;
                    const letter = String.fromCharCode(65 + index);
                    return (
                      <motion.button key={index}
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.35 + index * 0.05 }}
                        onClick={() => setSelectedAnswer(option)}
                        className={`w-full p-4 rounded-xl border transition-all text-left ${isSelected ? "border-primary bg-primary/5 glow-border" : "border-border bg-accent/20 hover:border-primary/30"}`}
                        whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-medium transition-all ${isSelected ? "bg-primary text-primary-foreground" : "bg-muted/30 text-muted-foreground"}`}>
                            {letter}
                          </div>
                          <span className="flex-1">{option}</span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {/* Open-ended */}
              {question.type === "open-ended" && (
                <div className="mb-6">
                  <div className="flex items-center justify-center min-h-[24px] mb-3">
                    {isRecording && (
                      <motion.div className="flex items-center gap-2 text-[var(--status-processing)]"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <motion.div className="w-2 h-2 rounded-full bg-[var(--status-processing)]"
                          animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }} />
                        <span className="text-xs font-medium">Recording...</span>
                      </motion.div>
                    )}
                    {isTranscribing && (
                      <motion.div className="flex items-center gap-2 text-primary"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <motion.div className="w-2 h-2 rounded-full bg-primary"
                          animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }} />
                        <span className="text-xs font-medium">Transcribing...</span>
                      </motion.div>
                    )}
                  </div>

                  <AnimatePresence>
                    {isRecording && (
                      <motion.div className="flex items-center gap-[5px] justify-center mb-4"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {[...Array(9)].map((_, i) => (
                          <motion.div key={i} className="w-1 bg-primary rounded-full"
                            animate={{ height: [10, 30, 10] }}
                            transition={{ duration: 0.65, repeat: Infinity, delay: i * 0.07 }} />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {showTranscript && transcript && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="mb-4 p-4 bg-muted/30 rounded-xl border border-border"
                      >
                        <p className="text-xs text-muted-foreground mb-1">Transcript:</p>
                        <p className="text-sm leading-relaxed">{transcript}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex justify-center">
                    {!(showTranscript && transcript.trim()) ? (
                      <motion.button onClick={toggleRecording}
                        disabled={isSubmitting || isTranscribing}
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all
                          ${isRecording ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"}
                          ${isSubmitting || isTranscribing ? "opacity-50 cursor-not-allowed" : ""}`}
                        whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.93 }}>
                        {isRecording
                          ? <Mic className="w-6 h-6" strokeWidth={2} />
                          : <MicOff className="w-6 h-6" strokeWidth={2} />}
                      </motion.button>
                    ) : (
                      <motion.button onClick={handleRetake} disabled={isSubmitting}
                        className="px-6 py-2.5 rounded-xl bg-muted/60 border border-border text-muted-foreground hover:bg-muted/80 transition-all text-sm"
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        Retake Recording
                      </motion.button>
                    )}
                  </div>
                </div>
              )}

              {/* Submit */}
              {(() => {
                const hasAnswer =
                  (question.type === "multiple-choice" && !!selectedAnswer) ||
                  (question.type === "open-ended" && showTranscript && !!transcript.trim());
                const isDisabled = isSubmitting || isTranscribing || (!isLastQuestion && !hasAnswer);
                return (
                  <motion.button
                    onClick={() => handleFinalSubmit(false)}
                    disabled={isDisabled}
                    className={`w-full px-6 py-4 rounded-xl transition-all font-medium flex items-center justify-center gap-2
                     ${isDisabled
                      ? "bg-primary/40 text-primary-foreground/60 cursor-not-allowed opacity-60"
                      : "bg-primary text-primary-foreground hover:shadow-lg"} border border-border`}
                    whileHover={!isDisabled ? { scale: 1.01 } : {}}
                    whileTap={!isDisabled ? { scale: 0.99 } : {}}
                  >
                    {isSubmitting ? (
                      <><Loader2 className="w-4 h-4 animate-spin" />{submitLabel ?? defaultSubmitLabel}</>
                    ) : defaultSubmitLabel}
                  </motion.button>
                );
              })()}

              {/* Skip */}
              {questionNumber < totalQuestions && (
                <motion.button onClick={handleSkip}
                  disabled={isSubmitting || isTranscribing}
                  className={`w-full mt-3 px-6 py-3 rounded-xl border border-border text-muted-foreground transition-all text-sm flex items-center justify-center gap-2
                    ${isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-muted/40"}`}>
                  {isSubmitting && submitLabel === "Skipping…" ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Skipping…</>
                  ) : "Skip Question"}
                </motion.button>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}