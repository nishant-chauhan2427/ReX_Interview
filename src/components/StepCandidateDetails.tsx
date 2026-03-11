import { ArrowLeft } from "lucide-react";

interface StepCandidateDetailsProps {
  onContinue: () => void;
  onBack: () => void;
  candidateName?: string;
  candidateEmail?: string;
  jdData?: any;
}

export function StepCandidateDetails({
  onContinue,
  onBack,
  candidateName = "",
  candidateEmail = "",
  jdData,
}: StepCandidateDetailsProps) {
  const firstName = candidateName.trim().split(" ")[0] || "Candidate";
  const lastName = candidateName.trim().split(" ").slice(1).join(" ");

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-4xl rounded-3xl border border-white/10 bg-[rgba(20,22,30,0.85)] p-8 md:p-10 shadow-2xl backdrop-blur-sm">
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Step 3 of 11</span>
            <span>Candidate Details</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[20%] rounded-full bg-primary" />
          </div>
        </div>

        <div className="mb-2 text-3xl">👤</div>
        <h2 className="mb-2 text-3xl font-bold">Your Details</h2>
        <p className="mb-5 text-muted-foreground">
          Review your personal and professional information.
        </p>

        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">First Name</label>
            <input
              defaultValue={firstName}
              placeholder="First Name"
              className="w-full rounded-xl border border-white/15 bg-white/[0.03] px-3 py-2 focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Last Name</label>
            <input
              defaultValue={lastName}
              placeholder="Last Name"
              className="w-full rounded-xl border border-white/15 bg-white/[0.03] px-3 py-2 focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Email Address</label>
            <input
              type="email"
              defaultValue={candidateEmail}
              placeholder="Email"
              className="w-full rounded-xl border border-white/15 bg-white/[0.03] px-3 py-2 focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Phone Number</label>
            <input
              type="tel"
              defaultValue=""
              placeholder="Phone"
              className="w-full rounded-xl border border-white/15 bg-white/[0.03] px-3 py-2 focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Current Company</label>
            <input
              defaultValue={jdData?.metadata?.client_name || ""}
              placeholder="Current Company"
              className="w-full rounded-xl border border-white/15 bg-white/[0.03] px-3 py-2 focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Years of Experience</label>
            <input
              defaultValue={jdData?.profile?.years_experience || ""}
              placeholder="Years of Experience"
              className="w-full rounded-xl border border-white/15 bg-white/[0.03] px-3 py-2 focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="mb-5">
          <label className="mb-1 block text-sm text-muted-foreground">LinkedIn Profile</label>
          <input
            defaultValue=""
            placeholder="LinkedIn URL"
            className="w-full rounded-xl border border-white/15 bg-white/[0.03] px-3 py-2 focus:outline-none focus:border-primary"
          />
        </div>

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
            className="flex-1 rounded-xl bg-primary px-4 py-3 text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/20"
          >
            Save & Continue →
          </button>
        </div>
      </div>
    </div>
  );
}
