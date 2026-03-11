interface StepThankYouProps {
  onStartOver: () => void;
  completedTime: string;
  candidateName?: string;
  sessionId?: string;
}

const StepThankYou = ({
  onStartOver,
  completedTime,
  candidateName = "Candidate",
  sessionId = "PAI-SESSION",
}: StepThankYouProps) => (
  <div className="pai-card">
    <div className="thankyou-wrap">
      <div className="thankyou-icon">🎉</div>
      <div className="thankyou-title">
        Thank You, <span>{candidateName}!</span>
      </div>
      <p className="thankyou-msg">
        You've successfully completed your interview with <strong>PAI</strong>. Your session has been securely
        recorded and submitted.
      </p>
      <div className="thankyou-card">
        <strong>What happens next?</strong>
        <br />
        For next updates, our hiring manager will be in touch with you. You can expect to hear from the VAYUZ talent
        team within 3-5 business days.
      </div>
      <div className="thankyou-ref">
        Session ID: <span>{sessionId}</span> · Completed <span>{completedTime}</span>
      </div>
      <div style={{ display: "flex", gap: 10, width: "100%", marginTop: 20 }}>
        <button className="btn-pai btn-pai-ghost" onClick={onStartOver} style={{ fontSize: 12 }}>
          Start Over
        </button>
        <button className="btn-pai btn-pai-primary" onClick={() => {}} style={{ fontSize: 12 }}>
          Close Session
        </button>
      </div>
    </div>
  </div>
);

export { StepThankYou };
export default StepThankYou;
