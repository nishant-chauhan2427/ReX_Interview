import { useState } from "react";
import { ArrowLeft, Building2, MapPin, Briefcase, Wallet } from "lucide-react";

interface StepJDConsentProps {
  onContinue: () => void;
  onBack: () => void;
  jdData?: any;
}

const TEXT_LIMIT = 320;

export function StepJDConsent({ onContinue, onBack, jdData }: StepJDConsentProps) {
  const [check1, setCheck1] = useState(true);
  const [check2, setCheck2] = useState(true);
  const [showMore, setShowMore] = useState(false);

  const mandatorySkills: string[] = Array.isArray(jdData?.skills) ? jdData.skills : [];
  const summaryText: string =
    jdData?.raw_text || "Review the role details and give your consent to proceed.";

  const isLongText = summaryText.length > TEXT_LIMIT;
  const displayText = showMore ? summaryText : summaryText.slice(0, TEXT_LIMIT);

  const canProceed = check1 && check2;

  const badges = [
    { icon: <Building2 size={11} />, value: jdData?.client_name },
    { icon: <MapPin size={11} />, value: jdData?.location },
    { icon: <Briefcase size={11} />, value: jdData?.work_type },
    { icon: <Wallet size={11} />, value: jdData?.budget },
  ].filter((b) => b.value && b.value.trim() !== "");

  return (
    /*
      ✅ SCROLL FIX:
      - Outer div: fixed inset-0 + overflow-y-auto — yeh poora viewport cover karta hai
        aur scroll enable karta hai. min-h-screen avoid kiya kyunki woh
        parent ke overflow ko override kar deta tha.
      - Inner wrapper: py-6 px-4 flex justify-center
    */
    <div className="fixed inset-0 overflow-y-auto">
      <div className="flex min-h-full items-start justify-center py-8 px-4">
        <div className="w-full max-w-[42rem] rounded-3xl border border-white/10 bg-[rgba(20,22,30,0.85)] p-8 md:p-10 shadow-2xl backdrop-blur-sm">

          <h2 className="mb-2 text-3xl font-bold">Job Overview</h2>
          <p className="mb-5 text-muted-foreground">
            Review the role details and give your consent to proceed.
          </p>

          {/* Job card */}
          <div className="mb-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <h3 className="mb-3 text-xl font-semibold">
              {jdData?.title || jdData?.designation || "Role"}
            </h3>

            {badges.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {badges.map((b, i) => (
                  <span
                    key={i}
                    className="rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-xs flex items-center gap-1"
                  >
                    {b.icon} {b.value}
                  </span>
                ))}
              </div>
            )}

            <p className="mb-1 text-sm leading-relaxed text-muted-foreground">
              {displayText}
              {!showMore && isLongText && "..."}
            </p>
            {isLongText && (
              <button
                type="button"
                onClick={() => setShowMore((v) => !v)}
                className="mb-3 text-xs text-primary hover:underline focus:outline-none"
              >
                {showMore ? "Show less ↑" : "Show more ↓"}
              </button>
            )}

            <p className="text-sm leading-relaxed text-muted-foreground">
              <strong className="text-foreground">Skills required:</strong>{" "}
              {mandatorySkills.length > 0
                ? mandatorySkills.slice(0, 4).join(", ")
                : "As per job description"}
            </p>
          </div>

          {/* Checkbox 1 */}
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

          {/* Checkbox 2 */}
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

          {/* ✅ BUTTON FIX:
              - Previous: same border style as before (border border-white/20)
              - Accept & Continue: always visible, disabled state = faded with border
          */}
          <div className="mt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-3 transition-colors hover:bg-white/5"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </button>

            <button
              type="button"
              onClick={canProceed ? onContinue : undefined}
              className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition-all
                ${
                  canProceed
                    ? "border-primary bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/20 cursor-pointer"
                    : "border-white/15 bg-white/5 text-white/30 cursor-not-allowed"
                }`}
            >
              Accept &amp; Continue →
            </button>
          </div>

          {!canProceed && (
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Please accept both consents to continue.
            </p>
          )}

        </div>
      </div>
    </div>
  );
}