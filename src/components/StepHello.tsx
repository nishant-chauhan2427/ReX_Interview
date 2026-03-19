import PiEmblem from "./PiEmblem";
import { CreditCard, MicOff, Wifi, Camera, MonitorOff } from "lucide-react";

interface StepHelloProps {
  onBegin: () => void;
  candidateName?: string;
  jobTitle?: string;
  companyName?: string;
  jobLocation?: string;
}

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
  // <div className="min-h-screen flex items-center justify-center p-4">
  // <div className="min-h-screen flex items-center justify-center p-4 pb-12">
  <div className="min-h-screen flex items-center justify-center p-4 pb-16">
    <div className="w-full max-w-[38rem] rounded-3xl border border-white/10 bg-[rgba(20,22,30,0.85)] p-5 md:p-8 shadow-2xl backdrop-blur-sm">

      {/* Emblem */}
      <div className="flex justify-center mb-6">
        <PiEmblem size={88} id="rg-hello" />
      </div>

      {/* Greeting */}
      <h2 className="mb-2 text-3xl font-bold text-center">
        Hello, <span className="text-primary">{candidateName}</span> 👋
      </h2>

      {/* Subtitle */}
      <p className="mb-5 text-muted-foreground text-center">
        Welcome to your interview session with <strong className="text-foreground">PAI</strong>, your intelligent hiring companion by REX.
      </p>

      {/* Badge */}
      <div className="flex justify-center mb-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/35 bg-primary/10 px-4 py-1.5 text-xs text-muted-foreground">
          <span className="text-primary font-bold">π</span>
          Interviewed by <strong className="text-foreground">PAI</strong> · AI-powered · Secure
        </span>
      </div>

      {/* Prep Instructions Card */}
      <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex flex-col gap-3">
        {prepInstructions.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
              {item.icon}
            </span>
            <span className="text-sm text-muted-foreground">{item.text}</span>
          </div>
        ))}
      </div>

      {/* Action Button */}
      <button
        className="mx-auto block rounded-xl bg-primary px-8 py-3 text-sm text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/20 whitespace-nowrap"
        onClick={onBegin}
      >
        Begin Interview →
      </button>

    </div>
  </div>
);

export { StepHello };
export default StepHello;
// import PiEmblem from "./PiEmblem";
// import { CreditCard, MicOff, Wifi, Camera, MonitorOff } from "lucide-react";

// interface StepHelloProps {
//   onBegin: () => void;
//   candidateName?: string;
//   jobTitle?: string;
//   companyName?: string;
//   jobLocation?: string;
// }

// const prepInstructions = [
//   { icon: <CreditCard size={18} />, text: "Please keep your Aadhaar card ready for verification." },
//   { icon: <MicOff size={18} />, text: "Ensure you are in a quiet environment." },
//   { icon: <Wifi size={18} />, text: "Use a stable internet connection." },
//   { icon: <Camera size={18} />, text: "Keep your camera on during the session." },
//   { icon: <MonitorOff size={18} />, text: "Do not switch tabs during the interview." },
// ];

// const StepHello = ({
//   onBegin,
//   candidateName = "Candidate",
//   jobTitle = "Role",
//   companyName = "Company",
//   jobLocation = "Remote",
// }: StepHelloProps) => (
//   // <div className="min-h-screen flex items-center justify-center p-6">
//     <div className="min-h-screen flex items-center justify-center p-4"></div>
//     {/* <div className="w-full max-w-[42rem] rounded-3xl border border-white/10 bg-[rgba(20,22,30,0.85)] p-8 md:p-10 shadow-2xl backdrop-blur-sm"> */}
//     <div className="w-full max-w-[38rem] rounded-3xl border border-white/10 bg-[rgba(20,22,30,0.85)] p-5 md:p-8 shadow-2xl backdrop-blur-sm">
      
//       {/* Emblem */}
//       <div className="flex justify-center mb-6">
//         <PiEmblem size={88} id="rg-hello" />
//       </div>

//       {/* Greeting */}
//       <h2 className="mb-2 text-3xl font-bold text-center">
//         Hello, <span className="text-primary">{candidateName}</span> 👋
//       </h2>

//       {/* Subtitle */}
//       <p className="mb-5 text-muted-foreground text-center">
//         Welcome to your interview session with <strong className="text-foreground">PAI</strong>, your intelligent hiring companion by REX.
//       </p>

//       {/* Badge */}
//       <div className="flex justify-center mb-6">
//         <span className="inline-flex items-center gap-2 rounded-full border border-primary/35 bg-primary/10 px-4 py-1.5 text-xs text-muted-foreground">
//           <span className="text-primary font-bold">π</span>
//           Interviewed by <strong className="text-foreground">PAI</strong> · AI-powered · Secure
//         </span>
//       </div>

//       {/* Prep Instructions Card */}
//       <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex flex-col gap-3">
//         {prepInstructions.map((item, i) => (
//           <div key={i} className="flex items-center gap-3">
//             <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
//               {item.icon}
//             </span>
//             <span className="text-sm text-muted-foreground">{item.text}</span>
//           </div>
//         ))}
//       </div>

//       {/* Action Button */}
//       {/* <button
//         className="w-full rounded-xl bg-primary px-4 py-3 text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/20"
//         onClick={onBegin}
//       >
//         Begin Interview →
//       </button> */}
//      {/* Action Button */}
// <button
//   className="mx-auto block rounded-xl bg-primary px-8 py-3 text-sm text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/20 whitespace-nowrap"
//   onClick={onBegin}
// >
//   Begin Interview →
// </button>
//     </div>
//   </div>
// );

// export { StepHello };
// export default StepHello;