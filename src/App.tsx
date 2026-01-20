import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { decryptValue } from "./utils/decrypt";
import { Toaster, toast } from "react-hot-toast";
import { StepIndicator } from "./components/StepIndicator";
import { Step1Welcome } from "./components/Step1Welcome";
import { Step2UserDetails } from "./components/Step2UserDetails";
import { Step3AadharVerification } from "./components/Step3AadharVerification";
import { Step4PhotoCapture } from "./components/Step4PhotoCapture";
import { Step4SystemCheck } from "./components/Step4SystemCheck";
import { Step5InterviewReady } from "./components/Step5InterviewReady";
import { Step6Question } from "./components/Step6Question";
import { Step7Completion } from "./components/Step7Completion";
import { Step8Results } from "./components/Step8Results";
import { Step9ThankYou } from "./components/Step9ThankYou";
import { postForm } from "./utils/api";
import axios from "axios";

/* ---------------- MOCK QUESTIONS ---------------- */
let screenRecorder: MediaRecorder | null = null;
let screenChunks: Blob[] = [];

export const startScreenRecording = (stream: MediaStream) => {
  screenChunks = [];
  screenRecorder = new MediaRecorder(stream);

  screenRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) screenChunks.push(e.data);
  };

  screenRecorder.start();
};

export const stopScreenRecording = (): Promise<Blob> => {
  return new Promise((resolve) => {
    if (!screenRecorder) return resolve(new Blob());

    screenRecorder.onstop = () => {
      resolve(new Blob(screenChunks, { type: "video/webm" }));
    };

    screenRecorder.stop();
  });
};


export default function App() {
  const [currentStep, setCurrentStep] = useState(1);

  /* ---------------- URL DATA ---------------- */
  const [initialUserData, setInitialUserData] = useState(null);

  /* ---------------- FLOW STATE ---------------- */
  const [userDetails, setUserDetails] = useState(null);
  const [aadharData, setAadharData] = useState(null);
  const [photoData, setPhotoData] = useState(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);

  const [cameraStream, setCameraStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);

  // ✅ ADD: holds real report summary from API
  const [reportSummary, setReportSummary] = useState(null);

  const totalSteps = 9;
  // const questions = mockQuestions.default;
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [fullscreenViolated, setFullscreenViolated] = useState(false);


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



  /* ---------------- PARSE URL ONCE ---------------- */

  useEffect(() => {
  const handleFullscreenChange = async () => {
    if (
      currentStep >= 7 && // interview started
      !document.fullscreenElement &&
      !fullscreenViolated
    ) {
      setFullscreenViolated(true);

      toast.error("Fullscreen exited. Interview terminated.");

      alert(
        "You exited fullscreen mode.\n\nAs per interview rules, the test has been terminated.",
      );

      try {
        await stopScreenRecording();
      } catch {}

      // HARD STOP — end test immediately
      setCurrentStep(10); // Thank You / End Screen
    }
  };

  document.addEventListener("fullscreenchange", handleFullscreenChange);
  return () =>
    document.removeEventListener(
      "fullscreenchange",
      handleFullscreenChange,
    );
}, [currentStep, fullscreenViolated]);

useEffect(() => {
  const blockEsc = (e: KeyboardEvent) => {
    if (e.key === "Escape" && currentStep >= 7) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  document.addEventListener("keydown", blockEsc);
  return () => document.removeEventListener("keydown", blockEsc);
}, [currentStep]);


  useEffect(() => {
    const segments = window.location.pathname.split("/").filter(Boolean);

    let name = "";
    let email = "";
    let testId = "";

    segments.forEach((segment) => {
      if (segment.startsWith("name:")) {
        name = decryptValue(decodeURIComponent(segment.replace("name:", "")));
      }

      if (segment.startsWith("emailid:")) {
        email = decryptValue(
          decodeURIComponent(segment.replace("emailid:", "")),
        );
      }

      if (segment.startsWith("testid:")) {
        testId = decryptValue(
          decodeURIComponent(segment.replace("testid:", "")),
        );
      }
    });

    setInitialUserData({ name, email, testId });
  }, []);

  const validateEmailLink = async (email: string) => {
    const API_BASE = import.meta.env.VITE_API_BASE_URL;

    const res = await fetch(
      `${API_BASE}/link/validate?email=${encodeURIComponent(email)}`,
    );

    if (!res.ok) {
      throw new Error("Invalid or expired link");
    }

    return res.json();
  };

  const fetchInterviewQuestions = async (testId: string) => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL;

      const res = await fetch(`${API_BASE}/testquestions/qa_test/${testId}`, {
        headers: { accept: "application/json" },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch questions");
      }

      const json = await res.json();

      if (json.status_code !== 200) {
        throw new Error("Invalid question response");
      }

      // 🔁 Map API → UI format
      const mappedQuestions = json.data.map((q: any) => ({
        id: q.question_id,
        text: q.question_text,
        expected_answer: q.answers?.[0]?.answer_text,
        type: "open-ended", // API gives reference answers, not MCQs
      }));

      setQuestions(mappedQuestions);
    } catch (err) {
      console.error("Question fetch failed:", err);
      alert("Failed to load interview questions.");
    }
  };

  /* ---------------- HELPERS ---------------- */
  const handleNext = () => setCurrentStep((s) => s + 1);

  const handleStep1Next = async () => {
    try {
      if (!initialUserData?.email) {
        throw new Error("Email missing in URL");
      }

      // 🔥 VALIDATE EMAIL FROM URL
      await validateEmailLink(initialUserData.email);

      // ✅ Proceed only if validation succeeds
      setCurrentStep(2);
    } catch (err) {
      console.error("Link validation failed:", err);
      alert("This interview link is invalid or expired.");
    }
  };

  const handleUserDetails = (data) => {
    setUserDetails(data);
    handleNext();
  };

  const handleAadharVerification = async (data) => {
    setAadharData(data);
    await startCamera();
    handleNext();
  };

  const handleSystemCheckComplete = ({ camera, screen }) => {
    setCameraStream(camera);
    setScreenStream(screen);
    setCurrentStep(6);
  };

  // ✅ CHANGE: Upload candidate photo after capture
  
const handlePhotoCapture = async (photo: string) => {
  try {
    // 🔹 Convert base64 → Blob
    const blob = await fetch(photo).then((r) => r.blob());

    // 🔹 Prepare form data
    const formData = new FormData();
    formData.append("file", blob, "candidate_photo.png");
    formData.append(
      "candidate_id",
      localStorage.getItem("candidate_id") || "",
    );

    // 🔥 AXIOS API CALL (centralized error handling)
    const data = await postForm(
      "/auth/upload-candidate-image",
      formData,
    );

    console.log("Photo upload success:", data);

    // 🔹 Save success flag
    localStorage.setItem("iscandidatephoto", "true");

    // 🔹 Store photo locally if needed
    setPhotoData(photo);

    toast.success("Photo uploaded successfully");

    // ✅ Move to NEXT STEP
    handleNext();
  } catch (err: any) {
    console.error("Photo upload error:", err);

    // 🎯 Show REAL backend error
    const message =
      err instanceof Error
        ? err.message
        : "Failed to upload photo. Please try again.";

    toast.error(message);
  }
};

  // ✅ CHANGE: Fetch real report summary before Step8Results
  const handleInterviewComplete = async () => {
  try {
    const candidateId = localStorage.getItem("candidate_id");
    const candidateName =
      localStorage.getItem("candidate_name") || initialUserData?.name;

    if (!candidateId || !candidateName) {
      throw new Error("Candidate details missing");
    }

    toast.loading("Finalizing interview…");

    /* ---------- STOP + UPLOAD SCREEN RECORDING ---------- */
    const screenBlob = await stopScreenRecording();

    if (screenBlob.size > 0) {
      const formData = new FormData();
      formData.append("candidate_id", candidateId);
      formData.append(
        "recording",
        new File([screenBlob], "screen_recording.webm", {
          type: "video/webm",
        }),
      );

      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/frames/upload_screen_recording`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
    }

    /* ---------- NOW CALL RESULT API ---------- */
    const body = new URLSearchParams();
    body.append("candidate_id", candidateId);
    body.append("candidate_name", candidateName);

    const { data } = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/questions/get_result`,
      body,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    setReportSummary(data);
    toast.dismiss();
    setCurrentStep(8);
  } catch (err) {
    console.error("Interview completion failed", err);
    toast.error("Failed to finalize interview");
  }
};



  const handleAnswer = ({ questionId, transcript, timeSpent }) => {
    setAnswers((prev) => [
      ...prev,
      {
        questionId,
        answer: transcript,
        time: timeSpent,
      },
    ]);

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
  };

  const startCamera = async () => {
    if (cameraStream) return cameraStream;

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });

    setCameraStream(stream);
    return stream;
  };

  /* ---------------- RENDER ---------------- */
  return (
    <>
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: "#111827",
          color: "#fff",
          borderRadius: "10px",
        },
      }}
    />
    <div className="min-h-screen w-full bg-background text-foreground px-4 py-4">
      <header className="fixed top-4 left-12">
        <motion.div className="flex justify-start  items-center">
          {" "}
          <img
            src="/VAYUZ-logo-hd.png"
            alt="VAYUZ"
            className="h-8 object-contain"
          />{" "}
        </motion.div>
      </header>
      <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <motion.div key="step1">
            <Step1Welcome onNext={handleStep1Next} />
          </motion.div>
        )}

        {currentStep === 2 && initialUserData && (
          <motion.div key="step2">
            <Step2UserDetails
              initialData={initialUserData}
              onNext={handleUserDetails}
            />
          </motion.div>
        )}

        {currentStep === 3 && (
          <motion.div key="step3">
            <Step3AadharVerification onNext={handleAadharVerification} />
          </motion.div>
        )}

        {currentStep === 4 && (
          <motion.div key="step4">
            <Step4PhotoCapture
              cameraStream={cameraStream}
              onNext={handlePhotoCapture}
            />
          </motion.div>
        )}

        {currentStep === 5 && (
          <motion.div key="step5">
            <Step4SystemCheck onNext={handleSystemCheckComplete} />
          </motion.div>
        )}

        {currentStep === 6 && (
          <motion.div key="step6">
            <Step5InterviewReady
              onNext={async () => {
  await fetchInterviewQuestions(initialUserData?.testId);
  await enterFullscreen();

  if (screenStream) {
    startScreenRecording(screenStream);
  }

  setCurrentStep(7);
}}

            />
          </motion.div>
        )}

        {currentStep === 7 && (
          <motion.div key="step7">
            <Step6Question
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={questions.length}
              question={questions[currentQuestionIndex]}
              onAnswer={handleAnswer}
              cameraStream={cameraStream}
              screenStream={screenStream}
            />
          </motion.div>
        )}

        {currentStep === 8 && (
          <motion.div key="step8">
            <Step7Completion onNext={handleNext} />
          </motion.div>
        )}

        {currentStep === 9 && (
          <motion.div key="step9">
            <Step8Results
              reportSummary={reportSummary}
              onRestart={handleRestart}
            />
          </motion.div>
        )}

        {currentStep === 10 && (
          <motion.div key="step10">
            <Step9ThankYou onRestart={handleRestart} />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div className='fixed w-full bottom-6 flex justify-center items-center'>Powered by 
        <img
          src="/PRAGYAN.AI-logo-dark.svg"
          alt="PRAGYAN.AI Logo"
          className="h-8 object-contain"
        />
      </motion.div>
    </div>
    </>
  );
}
