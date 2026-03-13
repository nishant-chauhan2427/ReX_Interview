import { useState } from "react";
import { ArrowLeft, ClipboardCheck, Building2, MapPin, Briefcase, Wallet } from "lucide-react";

interface StepJDConsentProps {
  onContinue: () => void;
  onBack: () => void;
  jdData?: any;
}

export function StepJDConsent({ onContinue, onBack, jdData }: StepJDConsentProps) {
  const [check1, setCheck1] = useState(true);
  const [check2, setCheck2] = useState(true);

  // const mandatorySkills: string[] = jdData?.skills?.mandatory || [];
  const mandatorySkills: string[] = Array.isArray(jdData?.skills) ? jdData.skills : [];
  const summaryText =
    jdData?.raw_text ||
    "Review the role details and give your consent to proceed.";

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-[42rem] rounded-3xl border border-white/10 bg-[rgba(20,22,30,0.85)] p-8 md:p-10 shadow-2xl backdrop-blur-sm">
        {/* <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Step 2 of 11</span>
            <span>Job Overview & Consent</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[10%] rounded-full bg-primary" />
          </div>
        </div> */}

        {/* ✅ ClipboardCheck instead of 📋 */}
        {/* <div className="mb-2 text-3xl">
          <ClipboardCheck size={32} strokeWidth={1.5} />
        </div> */}
        <h2 className="mb-2 text-3xl font-bold">Job Overview</h2>
        <p className="mb-5 text-muted-foreground">
          Review the role details and give your consent to proceed.
        </p>

        <div className="mb-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <h3 className="mb-3 text-xl font-semibold">
            {jdData?.title || jdData?.designation || "Role"}
          </h3>
          <div className="mb-3 flex flex-wrap gap-2">
            {/* ✅ Building2 instead of 🏢 */}
            <span className="rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-xs flex items-center gap-1">
              <Building2 size={11} /> {jdData?.client_name || "VAYUZ Technologies"}
            </span>
            {/* ✅ MapPin instead of 📍 */}
            <span className="rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-xs flex items-center gap-1">
              <MapPin size={11} /> {jdData?.location || "Remote"}
            </span>
            {/* ✅ Briefcase instead of 💼 */}
            <span className="rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-xs flex items-center gap-1">
              <Briefcase size={11} /> {jdData?.work_type || "Full-time"}
            </span>
            {/* ✅ Wallet instead of 💰 */}
            <span className="rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-xs flex items-center gap-1">
              <Wallet size={11} /> {jdData?.budget || "NA"}
            </span>
          </div>
          <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
            {summaryText.slice(0, 320)}...
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            <strong className="text-foreground">Skills required:</strong>{" "}
            {mandatorySkills.length > 0
              ? mandatorySkills.slice(0, 4).join(", ")
              : "As per job description"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCheck1((v) => !v)}
          className="mb-3 flex w-full items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-left"
        >
          <div
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs ${
              check1 ? "border-primary bg-primary text-primary-foreground" : "border-white/25"
            }`}
          >
            {check1 ? "✓" : ""}
          </div>
          <div className="text-sm text-muted-foreground">
            <strong className="text-foreground">I agree to record this session</strong>
            <br />
            The video and audio will be securely processed by PAI.
          </div>
        </button>

        <button
          type="button"
          onClick={() => setCheck2((v) => !v)}
          className="mb-5 flex w-full items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-left"
        >
          <div
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs ${
              check2 ? "border-primary bg-primary text-primary-foreground" : "border-white/25"
            }`}
          >
            {check2 ? "✓" : ""}
          </div>
          <div className="text-sm text-muted-foreground">
            <strong className="text-foreground">I consent to background checks</strong>
            <br />
            As part of the evaluation process.
          </div>
        </button>

        <div className="mt-2 flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-3 transition-colors hover:bg-white/5"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </button>
          <button
            onClick={onContinue}
            disabled={!(check1 && check2)}
            className={`flex-1 rounded-xl px-4 py-3 text-primary-foreground transition-all
              ${check1 && check2 ? "bg-primary hover:shadow-lg hover:shadow-primary/20" : "bg-primary/50 cursor-not-allowed"}`}
          >
            Accept & Continue →
          </button>
        </div>
      </div>
    </div>
  );
}
// import { useState } from "react";
// import { ArrowLeft } from "lucide-react";

// interface StepJDConsentProps {
//   onContinue: () => void;
//   onBack: () => void;
//   jdData?: any;
// }

// export function StepJDConsent({ onContinue, onBack, jdData }: StepJDConsentProps) {
//   const [check1, setCheck1] = useState(true);
//   const [check2, setCheck2] = useState(true);

//   const mandatorySkills: string[] = jdData?.skills?.mandatory || [];
//   const summaryText =
//     jdData?.raw_text ||
//     "Review the role details and give your consent to proceed.";

//   return (
//     <div className="min-h-screen flex items-center justify-center p-6">
//       <div className="w-full max-w-[42rem] rounded-3xl border border-white/10 bg-[rgba(20,22,30,0.85)] p-8 md:p-10 shadow-2xl backdrop-blur-sm">
//         <div className="mb-6">
//           <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
//             <span>Step 2 of 11</span>
//             <span>Job Overview & Consent</span>
//           </div>
//           <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
//             <div className="h-full w-[10%] rounded-full bg-primary" />
//           </div>
//         </div>

//         <div className="mb-2 text-3xl">📋</div>
//         <h2 className="mb-2 text-3xl font-bold">Job Overview</h2>
//         <p className="mb-5 text-muted-foreground">
//           Review the role details and give your consent to proceed.
//         </p>

//         <div className="mb-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
//           <h3 className="mb-3 text-xl font-semibold">
//             {jdData?.title || jdData?.metadata?.designation || "Role"}
//           </h3>
//           <div className="mb-3 flex flex-wrap gap-2">
//             <span className="rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-xs">
//               🏢 {jdData?.metadata?.client_name || "VAYUZ Technologies"}
//             </span>
//             <span className="rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-xs">
//               📍 {jdData?.profile?.location || "Remote"}
//             </span>
//             <span className="rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-xs">
//               💼 {jdData?.profile?.work_type || "Full-time"}
//             </span>
//             <span className="rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-xs">
//               💰 {jdData?.profile?.budget || "NA"}
//             </span>
//           </div>
//           <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
//             {summaryText.slice(0, 320)}...
//           </p>
//           <p className="text-sm leading-relaxed text-muted-foreground">
//             <strong className="text-foreground">Skills required:</strong>{" "}
//             {mandatorySkills.length > 0
//               ? mandatorySkills.slice(0, 4).join(", ")
//               : "As per job description"}
//           </p>
//         </div>

//         <button
//           type="button"
//           onClick={() => setCheck1((v) => !v)}
//           className="mb-3 flex w-full items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-left"
//         >
//           <div
//             className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs ${
//               check1 ? "border-primary bg-primary text-primary-foreground" : "border-white/25"
//             }`}
//           >
//             {check1 ? "✓" : ""}
//           </div>
//           <div className="text-sm text-muted-foreground">
//             <strong className="text-foreground">I agree to record this session</strong>
//             <br />
//             The video and audio will be securely processed by Pai.
//           </div>
//         </button>

//         <button
//           type="button"
//           onClick={() => setCheck2((v) => !v)}
//           className="mb-5 flex w-full items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-left"
//         >
//           <div
//             className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs ${
//               check2 ? "border-primary bg-primary text-primary-foreground" : "border-white/25"
//             }`}
//           >
//             {check2 ? "✓" : ""}
//           </div>
//           <div className="text-sm text-muted-foreground">
//             <strong className="text-foreground">I consent to background checks</strong>
//             <br />
//             As part of the evaluation process.
//           </div>
//         </button>

//         <div className="mt-2 flex items-center gap-3">
//           <button
//             onClick={onBack}
//             className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-3 transition-colors hover:bg-white/5"
//           >
//             <ArrowLeft className="h-4 w-4" />
//             Previous
//           </button>
//           <button
//             onClick={onContinue}
//             disabled={!(check1 && check2)}
//             className={`flex-1 rounded-xl px-4 py-3 text-primary-foreground transition-all
//               ${check1 && check2 ? "bg-primary hover:shadow-lg hover:shadow-primary/20" : "bg-primary/50 cursor-not-allowed"}`}
//           >
//             Accept & Continue →
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
