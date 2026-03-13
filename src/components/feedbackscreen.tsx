import { useState } from "react";
import { MessageSquare, Bug, Workflow, CheckCircle2, Loader2 } from "lucide-react";

interface StepCandidateFeedbackProps {
  onSubmit: (feedback: FeedbackData) => void;
  onSkip: () => void;
  candidateName?: string;
}

export interface FeedbackData {
  interviewExperience: string;
  overallProcess: string;
  technicalIssues: string;
}

const feedbackSections = [
  {
    key: "interviewExperience" as keyof FeedbackData,
    icon: <MessageSquare size={16} />,
    label: "Interview Experience",
    placeholder: "How was your overall interview experience with PAI? Was it comfortable and clear?",
  },
  {
    key: "overallProcess" as keyof FeedbackData,
    icon: <Workflow size={16} />,
    label: "Overall Process",
    placeholder: "How did you find the onboarding steps — Aadhaar verification, photo capture, system check, etc.?",
  },
  {
    key: "technicalIssues" as keyof FeedbackData,
    icon: <Bug size={16} />,
    label: "Technical Issues / Bugs",
    placeholder: "Did you face any technical issues? Camera, mic, screen share, loading problems, etc.?",
  },
];

export function StepCandidateFeedback({
  onSubmit,
  onSkip,
  candidateName = "Candidate",
}: StepCandidateFeedbackProps) {
  const [feedback, setFeedback] = useState<FeedbackData>({
    interviewExperience: "",
    overallProcess: "",
    technicalIssues: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasAnyInput = Object.values(feedback).some((v) => v.trim().length > 0);

  const handleSubmit = async () => {
    if (!hasAnyInput) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 800)); // simulate submit
    setIsSubmitting(false);
    setSubmitted(true);
    setTimeout(() => onSubmit(feedback), 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-[38rem] rounded-3xl border border-white/10 bg-[rgba(20,22,30,0.85)] p-8 md:p-10 shadow-2xl backdrop-blur-sm">

        {!submitted ? (
          <>
            {/* Icon + Title */}
            <div className="mb-3 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/30 bg-primary/10">
                <MessageSquare className="h-6 w-6 text-primary" strokeWidth={1.5} />
              </div>
            </div>
            <h2 className="mb-2 text-center text-3xl font-bold">Share Your Feedback</h2>
            <p className="mb-6 text-center text-sm text-muted-foreground">
              Help us improve <strong className="text-foreground">PAI</strong> by sharing your experience.
              This takes less than a minute.
            </p>

            {/* Feedback Sections */}
            <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              {feedbackSections.map((section) => (
                <div
                  key={section.key}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
                      {section.icon}
                    </span>
                    <span className="text-sm font-medium text-foreground">{section.label}</span>
                  </div>
                  <textarea
                    rows={3}
                    value={feedback[section.key]}
                    onChange={(e) =>
                      setFeedback((prev) => ({ ...prev, [section.key]: e.target.value }))
                    }
                    placeholder={section.placeholder}
                    className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/40 focus:bg-white/[0.05] transition-colors"
                  />
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onSkip}
                className="flex flex-1 items-center justify-center rounded-xl border border-white/20 px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-white/5"
              >
                Skip
              </button>
              <button
                onClick={handleSubmit}
                disabled={!hasAnyInput || isSubmitting}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  hasAnyInput && !isSubmitting
                    ? "bg-primary text-white hover:shadow-lg hover:shadow-primary/20"
                    : "cursor-not-allowed bg-primary/30 text-white/50"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  "Submit Feedback →"
                )}
              </button>
            </div>
          </>
        ) : (
          /* Success State */
          <div className="flex flex-col items-center py-6 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-green-500/30 bg-green-500/10">
              <CheckCircle2 className="h-8 w-8 text-green-400" strokeWidth={1.5} />
            </div>
            <h2 className="mb-2 text-2xl font-bold">Thank you!</h2>
            <p className="text-sm text-muted-foreground">
              Your feedback has been submitted. It helps us make <strong className="text-foreground">PAI</strong> better for everyone.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}

export default StepCandidateFeedback;