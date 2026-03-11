import { ReactNode } from "react";

interface StepGuidelinesProps {
  onContinue: () => void;
}

const guidelines: { text: ReactNode }[] = [
  { text: <><strong>Quiet environment</strong> - Minimise background noise and distractions.</> },
  { text: <><strong>Stay on tab</strong> - Switching away from this tab will be flagged.</> },
  { text: <><strong>Answer clearly</strong> - Speak at a natural pace; Pai will transcribe in real time.</> },
  { text: <><strong>5 questions</strong> - You have ~3 minutes per question. Use your time wisely.</> },
  { text: <><strong>No assistance</strong> - This is an individual assessment; external help is not permitted.</> },
];

export function StepGuidelines({ onContinue }: StepGuidelinesProps) {
  return (
    <div className="pai-card">
      <div className="face-step-card">
        <div className="progress-wrap">
          <div className="progress-label">
            <span>Step 8 of 11</span>
            <span>Interview Guidelines</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: "72%" }} />
          </div>
        </div>

        <div className="card-icon">📝</div>
        <div className="card-title">Before We Begin</div>
        <div className="card-sub">Please read the guidelines carefully. Pai will be monitoring this session.</div>

        <div className="guideline-list">
          {guidelines.map((g, i) => (
            <div className="gl-item" key={i}>
              <div className="gl-num">{i + 1}</div>
              <div className="gl-text">{g.text}</div>
            </div>
          ))}
        </div>

        <button className="btn-pai btn-pai-primary" onClick={onContinue}>
          I Understand - Start →
        </button>
      </div>
    </div>
  );
}

export default StepGuidelines;
