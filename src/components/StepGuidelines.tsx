import { ReactNode } from "react";
import { ClipboardList } from "lucide-react";

interface StepGuidelinesProps {
  onContinue: () => void;
}

const guidelines: { text: ReactNode }[] = [
  { text: <><strong>Quiet environment</strong> — Minimise background noise and distractions.</> },
  { text: <><strong>Stay on tab</strong> — Switching away from this tab will be flagged.</> },
  { text: <><strong>Answer clearly</strong> — Speak at a natural pace; PAI will transcribe in real time.</> },
  { text: <><strong>10 questions</strong> — You have ~90 seconds per question. Use your time wisely.</> },
  { text: <><strong>No assistance</strong> — This is an individual assessment; external help is not permitted.</> },
];

export function StepGuidelines({ onContinue }: StepGuidelinesProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-[36rem] rounded-3xl border border-white/10 bg-[rgba(20,22,30,0.85)] p-8 md:p-10 shadow-2xl backdrop-blur-sm">

        {/* Progress */}
        {/* <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Step 8 of 11</span>
            <span>Interview Guidelines</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[72%] rounded-full bg-primary" />
          </div>
        </div> */}

        {/* Icon + Title — centered */}
        <div className="mb-3 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/30 bg-primary/10">
            <ClipboardList className="h-6 w-6 text-primary" strokeWidth={1.5} />
          </div>
        </div>
        <h2 className="mb-2 text-center text-3xl font-bold">Before We Begin</h2>
        <p className="mb-6 text-center text-sm text-muted-foreground">
          Please read the guidelines carefully. PAI will be monitoring this session.
        </p>

        {/* Guidelines List */}
        <div className="mb-6 flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          {guidelines.map((g, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-xs font-semibold text-primary">
                {i + 1}
              </span>
              <span className="text-sm text-muted-foreground leading-relaxed">{g.text}</span>
            </div>
          ))}
        </div>

        {/* Button */}
        <button
          onClick={onContinue}
          className="w-full rounded-xl bg-primary px-4 py-3 text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/20"
        >
          I Understand — Start →
        </button>
      </div>
    </div>
  );
}

export default StepGuidelines;