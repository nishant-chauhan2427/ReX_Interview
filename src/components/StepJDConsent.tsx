import { useState } from "react";
import { Building2, MapPin, Briefcase, X } from "lucide-react";

interface StepJDConsentProps {
  onContinue: () => void;
  onBack?: () => void;
  jdData?: any;
}

const TEXT_LIMIT = 180;

export function StepJDConsent({ onContinue, onBack, jdData }: StepJDConsentProps) {
  const [check1, setCheck1] = useState(true);
  const [check2, setCheck2] = useState(true);
  const [showMore, setShowMore] = useState(false);
  const [showJDModal, setShowJDModal] = useState(false);

  const mandatorySkills: string[] = Array.isArray(jdData?.skills) ? jdData.skills : [];
  const summaryText: string =
    jdData?.summary || "Review the role details and give your consent to proceed.";

  const isLongText = summaryText.length > TEXT_LIMIT;
  const displayText = showMore ? summaryText : summaryText.slice(0, TEXT_LIMIT);

  const canProceed = check1 && check2;

  const badges = [
    { icon: <Building2 size={11} />, value: jdData?.client_name },
    { icon: <MapPin size={11} />, value: jdData?.location },
    { icon: <Briefcase size={11} />, value: jdData?.work_type },
  ].filter((b) => b.value && b.value.trim() !== "");

  return (
    <>
      {/* ── Main page ── */}
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-start justify-center pt-20 pb-8 pl-16 pr-3 sm:pl-20 sm:pr-4 sm:pt-24 sm:pb-10">
          <div className="w-full max-w-[42rem] rounded-2xl sm:rounded-3xl border border-white/10 bg-[rgba(20,22,30,0.85)] p-5 sm:p-8 md:p-10 shadow-2xl backdrop-blur-sm">

            {/* Header */}
            <h2 className="mb-1.5 text-2xl sm:text-3xl font-bold leading-tight">Job Overview</h2>
            <p className="mb-4 sm:mb-5 text-sm sm:text-base text-muted-foreground">
              Review the role details and give your consent to proceed.
            </p>

            {/* Job card */}
            <div className="mb-4 sm:mb-5 rounded-xl sm:rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 sm:p-4">
              <h3 className="mb-2.5 sm:mb-3 text-lg sm:text-xl font-semibold leading-snug">
                {jdData?.title || jdData?.designation || "Role"}
              </h3>

              {badges.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1.5 sm:gap-2">
                  {badges.map((b, i) => (
                    <span
                      key={i}
                      className="rounded-full border border-primary/35 bg-primary/10 px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs flex items-center gap-1 max-w-full truncate"
                      title={b.value}
                    >
                      {b.icon}
                      <span className="truncate">{b.value}</span>
                    </span>
                  ))}
                </div>
              )}

              <p className="mb-1 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                {displayText}
                {!showMore && isLongText && "..."}
              </p>
              {isLongText && (
                <button
                  type="button"
                  onClick={() => setShowMore((v) => !v)}
                  className="mb-2.5 sm:mb-3 text-xs text-primary hover:underline focus:outline-none"
                >
                  {showMore ? "Show less ↑" : "Show more ↓"}
                </button>
              )}

              <p className="mb-3 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                <strong className="text-foreground">Skills required:</strong>{" "}
                {mandatorySkills.length > 0
                  ? mandatorySkills.slice(0, 4).join(", ")
                  : "As per job description"}
              </p>

              {/* View Full JD button */}
              <button
                type="button"
                onClick={() => setShowJDModal(true)}
                className="text-xs text-primary border border-primary/30 bg-primary/10 hover:bg-primary/20 rounded-lg px-3 py-1.5 transition-colors"
              >
                View Full JD ↗
              </button>
            </div>

            {/* Checkbox 1 */}
            <button
              type="button"
              onClick={() => setCheck1((v) => !v)}
              className="mb-2.5 sm:mb-3 flex w-full items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3 sm:p-3.5 text-left active:bg-white/5 transition-colors"
            >
              <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs ${check1 ? "border-primary bg-primary text-primary-foreground" : "border-white/25"}`}>
                {check1 ? "✓" : ""}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">
                <strong className="text-foreground">I agree to record this session</strong>
                <br />
                The video and audio will be securely processed by PAI.
              </div>
            </button>

            {/* Checkbox 2 */}
            <button
              type="button"
              onClick={() => setCheck2((v) => !v)}
              className="mb-4 sm:mb-5 flex w-full items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3 sm:p-3.5 text-left active:bg-white/5 transition-colors"
            >
              <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs ${check2 ? "border-primary bg-primary text-primary-foreground" : "border-white/25"}`}>
                {check2 ? "✓" : ""}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">
                <strong className="text-foreground">I consent to background checks</strong>
                <br />
                As part of the evaluation process.
              </div>
            </button>

            {/* Accept & Continue */}
            <div className="mt-2 flex justify-center">
              <button
                type="button"
                onClick={canProceed ? onContinue : undefined}
                className={`mx-auto block rounded-xl border px-8 py-3 text-sm font-medium whitespace-nowrap transition-all
                  ${canProceed
                    ? "border-primary bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/20 cursor-pointer active:opacity-90"
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

      {/* ── Full JD Modal ── */}
      {showJDModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 pl-16 sm:pl-20"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
          onClick={() => setShowJDModal(false)}
        >
          <div
            className="relative w-full max-w-[42rem] max-h-[80vh] rounded-2xl border border-white/10 bg-[rgba(18,20,28,0.97)] shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-start justify-between gap-4 p-5 sm:p-6 border-b border-white/10">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold leading-snug">
                  {jdData?.title || jdData?.designation || "Job Description"}
                </h3>
                {badges.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {badges.map((b, i) => (
                      <span
                        key={i}
                        className="rounded-full border border-primary/35 bg-primary/10 px-2.5 py-1 text-[11px] flex items-center gap-1"
                      >
                        {b.icon}
                        <span>{b.value}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowJDModal(false)}
                className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-muted-foreground hover:bg-white/10 transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* Modal body — scrollable */}
            <div className="overflow-y-auto p-5 sm:p-6 flex flex-col gap-5">

              {/* Meta info grid */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {[
                  { label: "Experience", value: jdData?.years_experience ? `${jdData.years_experience} yrs` : null },
                  { label: "Budget", value: jdData?.budget },
                  { label: "Location", value: jdData?.location },
                  { label: "Work Type", value: jdData?.work_type },
                ].filter((r) => r.value && r.value.trim() !== "").map((row, i) => (
                  <div key={i}>
                    <p className="text-[11px] text-muted-foreground/60 uppercase tracking-wide">{row.label}</p>
                    <p className="text-xs sm:text-sm text-foreground font-medium">{row.value}</p>
                  </div>
                ))}
              </div>

              {/* Summary */}
              {jdData?.summary && (
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground/60">About the Role</p>
                  <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">{jdData.summary}</p>
                </div>
              )}

              {/* Responsibilities */}
              {Array.isArray(jdData?.responsibilities) && jdData.responsibilities.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground/60">Responsibilities</p>
                  <ul className="flex flex-col gap-1.5">
                    {jdData.responsibilities.map((r: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Skills */}
              {Array.isArray(jdData?.skills) && jdData.skills.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground/60">Skills Required</p>
                  <div className="flex flex-wrap gap-2">
                    {jdData.skills.map((skill: string, i: number) => (
                      <span key={i} className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-muted-foreground">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}