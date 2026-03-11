import PiEmblem from "./PiEmblem";
import { CreditCard, MicOff, Wifi, Camera, MonitorOff } from "lucide-react";
interface StepHelloProps {
  onBegin: () => void;
  candidateName?: string;
  jobTitle?: string; 
  companyName?: string;
  jobLocation?: string;
}

// const prepInstructions = [
//   { icon: "\u{1FAAA}", text: "Please keep your Aadhaar card ready for verification." },
//   { icon: "\u{1F92B}", text: "Ensure you are in a quiet environment." },
//   { icon: "\u{1F310}", text: "Use a stable internet connection." },
//   { icon: "\u{1F4F7}", text: "Keep your camera on during the session." },
//   { icon: "\u{1F6AB}", text: "Do not switch tabs during the interview." },
// ];
const prepInstructions = [
  { icon: <CreditCard size={18} />, text: "Please keep your Aadhaar card ready for verification." },
  { icon: <MicOff size={18} />, text: "Ensure you are in a quiet environment." },
  { icon: <Wifi size={18} />, text: "Use a stable internet connection." },
  { icon: <Camera size={18} />, text: "Keep your camera on during the session." },
  { icon: <MonitorOff size={18} />, text: "Do not switch tabs during the interview." },
];

const StepHello = ({
  onBegin,
  candidateName = "Candidate",
  jobTitle = "Role",
  companyName = "Company",
  jobLocation = "Remote",
}: StepHelloProps) => (
  <div className="pai-card">
    <div className="hello-wrap">
      <PiEmblem size={88} id="rg-hello" />
      <div className="hello-greeting">
        Hello, <span>{candidateName}</span> {"\u{1F44B}"}
      </div>
      <p className="hello-sub">
        Welcome to your interview session with <strong>PAI</strong>, your intelligent hiring companion by REX.
      </p>
      <div className="pai-badge">
        <span className="pai-pi">{"\u03C0"}</span>
        <span>
          Interviewed by <strong>PAI</strong> {"\u00B7"} AI-powered {"\u00B7"} Secure
        </span>
      </div>

      <div className="prep-instructions">
        {prepInstructions.map((item, i) => (
          <div className="prep-item" key={i}>
            <span className="prep-icon">{item.icon}</span>
            <span className="prep-text">{item.text}</span>
          </div>
        ))}
      </div>

      {/* <div className="hello-role">
        {jobTitle} {"\u00B7"} {companyName}
      </div> */}

      <div className="hello-actions">
        {/* <div className="hello-tags">
          <span className="tag badge-blue">{"\u{1F4CD}"} {jobLocation}</span>
          <span className="tag badge-blue">{"\u23F1"} ~25 min</span>
          <span className="tag badge-blue">{"\u{1F512}"} Encrypted</span>
        </div> */}
        <button className="btn-pai btn-pai-primary" onClick={onBegin}>
          Begin Interview {"\u2192"}
        </button>
      </div>
    </div>
  </div>
);

export { StepHello };
export default StepHello;
