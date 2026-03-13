import { CheckCircle2, Clock, Hash, MessageSquare } from "lucide-react";

interface StepThankYouProps {
  onFeedback: () => void;
  onClose: () => void; // ✅ naya prop
  completedTime: string;
  candidateName?: string;
  sessionId?: string;
}

const StepThankYou = ({
  onFeedback,
  onClose,
  completedTime,
  candidateName = "Candidate",
  sessionId = "PAI-SESSION",
}: StepThankYouProps) => (
  <div className="min-h-screen flex items-center justify-center p-6">
    <div className="w-full max-w-[36rem] rounded-3xl border border-white/10 bg-[rgba(20,22,30,0.85)] p-8 md:p-10 shadow-2xl backdrop-blur-sm">

      {/* Icon */}
      <div className="mb-4 flex justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-green-500/30 bg-green-500/10">
          <CheckCircle2 className="h-7 w-7 text-green-400" strokeWidth={1.5} />
        </div>
      </div>

      {/* Title */}
      <h2 className="mb-2 text-center text-3xl font-bold">
        Thank You, <span className="text-primary">{candidateName}!</span>
      </h2>

      {/* Message */}
      <p className="mb-6 text-center text-sm text-muted-foreground">
        You've successfully completed your interview with <strong className="text-foreground">PAI</strong>. Your
        session has been securely recorded and submitted.
      </p>

      {/* What happens next */}
      <div className="mb-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <p className="mb-1.5 text-sm font-semibold text-foreground">What happens next?</p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Our hiring manager will be in touch with you shortly. You can expect to hear from the VAYUZ talent team
          within <strong className="text-foreground">3–5 business days</strong>.
        </p>
      </div>

      {/* Session meta */}
      <div className="mb-6 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-muted-foreground">
          <Hash className="h-3 w-3" />
          {sessionId}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {completedTime}
        </span>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onFeedback}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-white/5"
        >
          <MessageSquare className="h-4 w-4" />
          Share Feedback
        </button>

        {/* ✅ Close Session → Landing Page */}
        <button
          onClick={onClose}
          className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/20"
        >
          Close Session
        </button>
      </div>

    </div>
  </div>
);

export { StepThankYou };
export default StepThankYou;