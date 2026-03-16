// 
import { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { decryptValue } from "./utils/decrypt";
import { Toaster, toast } from "react-hot-toast";
import { StepIndicator } from "./components/StepIndicator";
import { AlertStrip } from "./components/AlertStrip";
import { ParticleCanvas } from "./components/ParticleCanvas";
import { StepHello } from "./components/StepHello";
import { StepJDConsent } from "./components/StepJDConsent";
import { Step3AadharVerification } from "./components/Step3AadharVerification";
import { Step4PhotoCapture } from "./components/Step4PhotoCapture";
import { StepScreenShare } from "./components/StepScreenShare";
import { StepSystemCheck } from "./components/StepSystemCheck";
import { StepGuidelines } from "./components/StepGuidelines";
import { Step5InterviewReady } from "./components/Step5InterviewReady";
import { Step6Question } from "./components/Step6Question";
import { StepThankYou } from "./components/StepThankYou";
import { StepCandidateFeedback } from "./components/FeedbackScreen.tsx"; 
import { postForm, postJSON } from "./utils/api";
import axios from "axios";
import { startScreenRecording, stopScreenRecording } from "./utils/screenrecoder";
import { PAILandingPage } from "./components/PaiLandingPageScreen";

interface JDResponse {
  status_code: number;
  message: string;
  data?: any;
}

/*
  STEP MAP:
  1  → StepHello
  2  → StepJDConsent
  3  → Step3AadharVerification
  4  → Step4PhotoCapture
  5  → StepScreenShare       ← saves camera + screen streams
  6  → StepSystemCheck       ← device/mic/audio check
  7  → StepGuidelines        ← rules → fetches questions + enters fullscreen → step 8
  8  → Step5InterviewReady   ← "You're all set!" + 3s countdown → step 9
  9  → Step6Question         ← interview questions
  10 → StepThankYou          ← "Share Feedback" → step 11
  11 → StepCandidateFeedback ← optional feedback → window.close()
*/

export default function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [alertOpen, setAlertOpen] = useState(true);
  const [isDark] = useState(true);

  const [initialUserData, setInitialUserData] = useState(null);
  const [jdData, setJdData] = useState<any>(null);

  const [userDetails, setUserDetails] = useState(null);
  const [aadharData, setAadharData] = useState(null);
  const [photoData, setPhotoData] = useState(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);

  const [cameraStream, setCameraStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);

  const [completedTime, setCompletedTime] = useState("");
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [fullscreenViolated, setFullscreenViolated] = useState(false);
  const [showLanding, setShowLanding] = useState(false);
  const totalSteps = 11;

  /* ---------------- FULLSCREEN GUARD ---------------- */
  const enterFullscreen = async () => {
    const elem = document.documentElement;
    if (!document.fullscreenElement) {
      try {
        await elem.requestFullscreen();
      } catch (err) {
        toast.error("Fullscreen permission is required to continue");
        throw err;
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = async () => {
      if (currentStep >= 9 && !document.fullscreenElement && !fullscreenViolated) {
        setFullscreenViolated(true);
        toast.error("Fullscreen exited. Interview terminated.");
        alert("You exited fullscreen mode.\n\nAs per interview rules, the test has been terminated.");
        try { await stopScreenRecording(); } catch {}
        setCompletedTime(new Date().toLocaleString());
        setCurrentStep(10);
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [currentStep, fullscreenViolated]);

  useEffect(() => {
    const blockEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && currentStep >= 9) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    document.addEventListener("keydown", blockEsc);
    return () => document.removeEventListener("keydown", blockEsc);
  }, [currentStep]);

  /* ---------------- PARSE URL ONCE ---------------- */
  useEffect(() => {
    const segments = window.location.pathname.split("/").filter(Boolean);
    const searchParams = new URLSearchParams(window.location.search);
    let name = "", email = "", testId = "", token = "";

    segments.forEach((segment) => {
      if (segment.startsWith("name:"))    name   = decryptValue(decodeURIComponent(segment.replace("name:", "")));
      if (segment.startsWith("emailid:")) email  = decryptValue(decodeURIComponent(segment.replace("emailid:", "")));
      if (segment.startsWith("testid:"))  testId = decryptValue(decodeURIComponent(segment.replace("testid:", "")));
      if (segment.startsWith("token:"))   token  = decodeURIComponent(segment.replace("token:", ""));
    });

    token = token || searchParams.get("token") || searchParams.get("auth_token") || searchParams.get("access_token") || "";
    console.log(testId, "testid");
    setInitialUserData({ name, email, testId, token });
  }, []);

  /* ---------------- FETCH JD ---------------- */
  useEffect(() => {
    const fetchJDDetails = async () => {
      if (!initialUserData?.testId) return;
      try {
        const JD_API_BASE = import.meta.env.VITE_API_BASE_URL || "https://rex.vayuz.com/pragyan/ai/api/v1";
        const headers: Record<string, string> = { accept: "application/json" };
        if (initialUserData?.token) headers.authorization = `Bearer ${initialUserData.token}`;

        const response = await fetch(
          `${JD_API_BASE}/link/job-description/${encodeURIComponent(initialUserData.testId)}`,
          { headers },
        );
        if (!response.ok) throw new Error("JD fetch failed");

        const json: JDResponse = await response.json();
        if (json.status_code === 200 && json.data) setJdData(json.data);
      } catch (err) {
        console.error("JD fetch failed:", err);
      }
    };
    fetchJDDetails();
  }, [initialUserData?.testId]);

  /* ---------------- EXPIRE LINK API ---------------- */
  const expireLinkAPI = async (email: string) => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/pragyan/ai-interview/ai/api/v1";
      const response = await fetch(`${API_BASE}/link/expire`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidate_email: email
        })
      });

      if (!response.ok) {
        throw new Error('Link expiry API call failed');
      }

      const result = await response.json();
      console.log('Link expired successfully:', result);
      return result;
    } catch (err) {
      console.error('Error expiring link:', err);
      throw err;
    }
  };

  /* ---------------- FETCH QUESTIONS (with link expiry) ---------------- */
  const questionsFetchedRef = useRef(false);

  const fetchInterviewQuestions = async (testId: string) => {
    if (questionsFetchedRef.current) return;
    questionsFetchedRef.current = true;
    
    try {
      // PEHLE link expire karo
      const candidateEmail = localStorage.getItem("candidate_email") || initialUserData?.email;
      if (candidateEmail) {
        console.log('Expiring link before fetching questions...');
        await expireLinkAPI(candidateEmail);
      }

      // AB questions fetch karo
      const API_BASE = import.meta.env.VITE_API_BASE_URL;
      const res = await fetch(`${API_BASE}/testquestions/qa_test/${testId}`, {
        headers: { accept: "application/json" },
      });
      if (!res.ok) throw new Error("Failed to fetch questions");
      const json = await res.json();
      if (json.status_code !== 200) throw new Error("Invalid question response");

      const mappedQuestions = json.data.map((q: any) => ({
        id: q.question_id,
        text: q.question_text,
        expected_answer: q.answers?.[0]?.answer_text,
        type: "open-ended",
      }));
      setQuestions(mappedQuestions);
    } catch (err) {
      questionsFetchedRef.current = false;
      console.error("Question fetch failed:", err);
      alert("Failed to load interview questions.");
    }
  };

  /* ---------------- HELPERS ---------------- */
  const handleNext = () => setCurrentStep((s) => s + 1);

  const validateEmailLink = async (email: string) => {
    const API_BASE = import.meta.env.VITE_API_BASE_URL;
    const res = await fetch(`${API_BASE}/link/validate?email=${encodeURIComponent(email)}`);
    if (!res.ok) {
      const errorData = await res.json();
      const error: any = new Error(errorData.message || "Invalid or expired link");
      error.response = { data: errorData };
      throw error;
    }
    return res.json();
  };

  const handleStep1Next = async () => {
    try {
      if (!initialUserData?.email) throw new Error("Email missing in URL");
      await validateEmailLink(initialUserData.email);
      localStorage.setItem("candidate_name", initialUserData.name || "");
      localStorage.setItem("candidate_email", initialUserData.email || "");
      localStorage.setItem("test_id", initialUserData.testId || "");
      localStorage.setItem("auth_token", initialUserData.token || "");
      setCurrentStep(2);
    } catch (err: any) {
      console.error("Link validation failed:", err);
      
      // Check if error response has API message
      if (err?.response?.data?.message) {
        toast.error(err.response.data.message);
      } else if (err?.message) {
        toast.error(err.message);
      } else {
        toast.error("This interview link is invalid or expired.");
      }
    }
  };

  const handleUserDetails = (data) => {
    const registerCandidateIfNeeded = async () => {
      const existing = localStorage.getItem("candidate_id");
      if (existing) return;
      if (!initialUserData?.name || !initialUserData?.email || !initialUserData?.testId)
        throw new Error("Candidate registration data missing");

      const recaptchaKey = import.meta.env.VITE_RECAPTCHA_KEY as string | undefined;
      let captchaToken = "";

      if (recaptchaKey) {
        if (!window.grecaptcha) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement("script");
            script.src = `https://www.google.com/recaptcha/api.js?render=${recaptchaKey}`;
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Failed to load reCAPTCHA"));
            document.body.appendChild(script);
          });
        }
        captchaToken = await new Promise<string>((resolve, reject) => {
          window.grecaptcha.ready(() => {
            window.grecaptcha.execute(recaptchaKey, { action: "submit" }).then(resolve).catch(reject);
          });
        });
      }

      const regResponse = await postJSON("/register/candidate", {
        name: initialUserData.name,
        email: initialUserData.email,
        test_id: initialUserData.testId,
        ...(captchaToken ? { recaptcha_token: captchaToken } : {}),
      });

      localStorage.setItem("candidate_name", regResponse.name || initialUserData.name);
      localStorage.setItem("candidate_email", initialUserData.email);
      localStorage.setItem("test_id", regResponse.test_id || initialUserData.testId);
      localStorage.setItem("candidate_id", regResponse.candidate_id);
      localStorage.setItem("session_id", regResponse.session_id);
    };

    (async () => {
      try {
        await registerCandidateIfNeeded();
        setUserDetails(data);
        handleNext();
      } catch (err: any) {
        console.error("Candidate registration failed:", err);
        toast.error(err?.message || "Failed to register candidate");
      }
    })();
  };

  const startCamera = async () => {
    if (cameraStream) return cameraStream;
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    setCameraStream(stream);
    return stream;
  };

  const handleAadharVerification = async (data) => {
    setAadharData(data);
    await startCamera();
    handleNext();
  };

  const handlePhotoCapture = async (photo: string) => {
    try {
      const blob = await fetch(photo).then((r) => r.blob());
      const formData = new FormData();
      formData.append("file", blob, "candidate_photo.png");
      formData.append("candidate_id", localStorage.getItem("candidate_id") || "");
      const data = await postForm("/auth/upload-candidate-image", formData);
      console.log("Photo upload success:", data);
      localStorage.setItem("iscandidatephoto", "true");
      setPhotoData(photo);
      toast.success("Photo uploaded successfully");
      handleNext(); // → step 5
    } catch (err: any) {
      console.error("Photo upload error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to upload photo. Please try again.");
    }
  };

  // Step 5 → Step 6
  const handleScreenShareComplete = ({ camera, screen }: { camera: MediaStream; screen: MediaStream }) => {
    setCameraStream(camera);
    setScreenStream(screen);
    setCurrentStep(6);
  };

  const ensureMicAndAudioReady = async () => {
    try {
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      micStream.getTracks().forEach((t) => t.stop());
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasAudioInput  = devices.some((d) => d.kind === "audioinput");
      const hasAudioOutput = devices.some((d) => d.kind === "audiooutput");
      if (!hasAudioInput)  { toast.error("Microphone device not detected.");          return false; }
      if (!hasAudioOutput) { toast.error("Speaker/Audio output device not detected."); return false; }
      return true;
    } catch {
      toast.error("Microphone permission is required before continuing.");
      return false;
    }
  };

  // Step 6 → Step 7
  const handleSystemCheckComplete = async () => {
    const audioReady = await ensureMicAndAudioReady();
    if (!audioReady) return;
    setCurrentStep(7);
  };

  const handleInterviewComplete = async () => {
    try {
      const candidateId   = localStorage.getItem("candidate_id");
      const candidateName = localStorage.getItem("candidate_name") || initialUserData?.name;
      if (!candidateId || !candidateName) throw new Error("Candidate details missing");

      toast.loading("Finalizing interview…");

      const screenBlob = await stopScreenRecording();
      if (screenBlob.size > 0) {
        const formData = new FormData();
        formData.append("candidate_id", candidateId);
        formData.append("recording", new File([screenBlob], "screen_recording.webm", { type: "video/webm" }));
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/frames/upload_screen_recording`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } },
        );
      }

      const body = new URLSearchParams();
      body.append("candidate_id",   candidateId);
      body.append("candidate_name", candidateName);
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/questions/get_result`,
        body,
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
      );

      setCompletedTime(new Date().toLocaleString());
      toast.dismiss();
      setCurrentStep(10);
    } catch (err) {
      console.error("Interview completion failed:", err);
      toast.error("Failed to finalize interview");
    }
  };

  const handleAnswer = ({ questionId, transcript, timeSpent }) => {
    setAnswers((prev) => [...prev, { questionId, answer: transcript, time: timeSpent }]);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((i) => i + 1);
    } else {
      handleInterviewComplete();
    }
  };

  const handleRestart = () => {
    setCurrentStep(1);
    setUserDetails(null);
    setAadharData(null);
    setPhotoData(null);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setCompletedTime("");
  };

  const stepMotionProps = {
    initial:    { opacity: 0, y: 18, scale: 0.985 },
    animate:    { opacity: 1, y: 0,  scale: 1 },
    exit:       { opacity: 0, y: -14, scale: 0.985 },
    transition: { duration: 0.36, ease: [0.22, 1, 0.36, 1] as const },
  };
  if (showLanding) return (
    <div style={{ height: "100vh", overflowY: "auto" }}>
      <PAILandingPage />
    </div>
  );
  /* ---------------- RENDER ---------------- */
  return (
    <>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: { background: "#111827", color: "#fff", borderRadius: "10px" },
        }}
      />
      <ParticleCanvas isDark={isDark} />
      {/* <AlertStrip visible={alertOpen} onDismiss={() => setAlertOpen(false)} /> */}

      <div className="relative z-10 min-h-screen w-full text-foreground px-4 py-4">
        <header className={`fixed left-12 ${alertOpen ? "top-14" : "top-4"}`}>
          <motion.div className="flex justify-start items-center">
            <img src="/VAYUZ-logo-hd.png" alt="VAYUZ" className="h-8 object-contain" />
          </motion.div>
        </header>

        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

        <AnimatePresence mode="wait" initial={false}>

          {/* STEP 1 — Hello */}
          {currentStep === 1 && (
            <motion.div key="step1" {...stepMotionProps}>
              <StepHello
                onBegin={handleStep1Next}
                candidateName={initialUserData?.name}
                jobTitle={jdData?.title}
                companyName={jdData?.client_name}
                jobLocation={jdData?.location}
              />
            </motion.div>
          )}

          {/* STEP 2 — JD Consent */}
          {currentStep === 2 && initialUserData && (
            <motion.div key="step2" {...stepMotionProps}>
              <StepJDConsent
                onBack={() => setCurrentStep(1)}
                onContinue={() => setCurrentStep(3)}
                jdData={jdData}
              />
            </motion.div>
          )}

          {/* STEP 3 — Aadhaar */}
          {currentStep === 3 && (
            <motion.div key="step3" {...stepMotionProps}>
              <Step3AadharVerification onNext={handleAadharVerification} />
            </motion.div>
          )}

          {/* STEP 4 — Photo */}
          {currentStep === 4 && (
            <motion.div key="step4" {...stepMotionProps}>
              <Step4PhotoCapture cameraStream={cameraStream} onNext={handlePhotoCapture} />
            </motion.div>
          )}

          {/* STEP 5 — Screen Share */}
          {currentStep === 5 && (
            <motion.div key="step5" {...stepMotionProps}>
              <StepScreenShare cameraStream={cameraStream} onNext={handleScreenShareComplete} />
            </motion.div>
          )}

          {/* STEP 6 — System Check */}
          {currentStep === 6 && (
            <motion.div key="step6" {...stepMotionProps}>
              <StepSystemCheck active={currentStep === 6} onContinue={handleSystemCheckComplete} />
            </motion.div>
          )}

          {/* STEP 7 — Guidelines */}
          {currentStep === 7 && (
            <motion.div key="step7-guidelines" {...stepMotionProps}>
              <StepGuidelines
                onContinue={async () => {
                  await fetchInterviewQuestions(initialUserData?.testId);
                  await enterFullscreen();
                  if (screenStream) startScreenRecording(screenStream);
                  setCurrentStep(8); // → Step5InterviewReady
                }}
              />
            </motion.div>
          )}

          {/* STEP 8 — Interview Ready + Countdown */}
          {currentStep === 8 && (
            <motion.div key="step8-ready" {...stepMotionProps}>
              <Step5InterviewReady onNext={() => setCurrentStep(9)} />
            </motion.div>
          )}

          {/* STEP 9 — Interview Questions */}
          {currentStep === 9 && questions.length > 0 && questions[currentQuestionIndex] ? (
            <motion.div key="step9-question" {...stepMotionProps}>
              <Step6Question
                questionNumber={currentQuestionIndex + 1}
                totalQuestions={questions.length}
                question={questions[currentQuestionIndex]}
                onAnswer={handleAnswer}
                cameraStream={cameraStream}
                screenStream={screenStream}
              />
            </motion.div>
          ) : currentStep === 9 ? (
            <motion.div key="step9-loading" className="flex items-center justify-center h-screen" {...stepMotionProps}>
              <p className="text-muted-foreground animate-pulse">Loading questions...</p>
            </motion.div>
          ) : null}

          {/* STEP 10 — Thank You */}
          {currentStep === 10 && (
            <motion.div key="step10-thankyou" {...stepMotionProps}>
              <StepThankYou
                onFeedback={() => setCurrentStep(11)}
                completedTime={completedTime || new Date().toLocaleString()}
                candidateName={localStorage.getItem("candidate_name") || initialUserData?.name || "Candidate"}
                sessionId={localStorage.getItem("session_id") || "PAI-SESSION"}
              />
            </motion.div>
          )}

          {/* STEP 11 — Candidate Feedback */}
          {currentStep === 11 && (
            <motion.div key="step11-feedback" {...stepMotionProps}>
              <StepCandidateFeedback
                candidateName={localStorage.getItem("candidate_name") || initialUserData?.name || "Candidate"}
                // onSubmit={() => window.close()}
                // onSkip={() => window.close()}
                onSubmit={() => setShowLanding(true)}
                onSkip={() => setShowLanding(true)}
              />
            </motion.div>
          )}

        </AnimatePresence>

        <motion.div className="fixed w-full bottom-0 flex justify-center items-center">
          Powered by
          <img src="/PRAGYAN.AI-logo-dark.svg" alt="PRAGYAN.AI Logo" className="h-8 object-contain" />
        </motion.div>
      </div>
    </>
  );
}