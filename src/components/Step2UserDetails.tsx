import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import { postJSON } from "../utils/api";

interface Step2UserDetailsProps {
  initialData: {
    name: string;
    email: string;
    testId: string;
  };
  onNext: (data: {
    name: string;
    email: string;
    testId: string;
  }) => void;
}

export function Step2UserDetails({
  initialData,
  onNext,
}: Step2UserDetailsProps) {
  /* ---------------- STATE ---------------- */
  const [isLoading, setIsLoading] = useState(false);

  const name = initialData.name || "";
  const email = initialData.email || "";
  const testId = initialData.testId || "";

  const recaptchaToken = import.meta.env.VITE_RECAPTCHA_KEY as string;

  /* ---------------- LOAD reCAPTCHA (FUNCTIONAL ONLY) ---------------- */
  useEffect(() => {
    if (!window.grecaptcha) {
      const script = document.createElement("script");
      script.src = `https://www.google.com/recaptcha/api.js?render=${recaptchaToken}`;
      script.async = true;
      document.body.appendChild(script);
    }
  }, [recaptchaToken]);

  /* ---------------- EXECUTE reCAPTCHA ---------------- */
  const executeRecaptcha = async (): Promise<string> => {
    if (!window.grecaptcha) {
      throw new Error("reCAPTCHA not ready");
    }

    return new Promise((resolve, reject) => {
      window.grecaptcha.ready(() => {
        window.grecaptcha
          .execute(recaptchaToken, { action: "submit" })
          .then(resolve)
          .catch(reject);
      });
    });
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name || !email || !testId) return;

    setIsLoading(true);

    try {
      /* ✅ Get reCAPTCHA token */
      const captchaToken = await executeRecaptcha();

      /* ✅ Register API (WITH reCAPTCHA) */
      const regResponse = await postJSON("/register/candidate", {
        name,
        email,
        test_id: testId,
        recaptcha_token: captchaToken,
      });

      /* ✅ Persist required data */
      localStorage.setItem("candidate_name", regResponse.name || name);
      localStorage.setItem("candidate_email", email);
      localStorage.setItem("test_id", regResponse.test_id || testId);
      localStorage.setItem("candidate_id", regResponse.candidate_id);
      localStorage.setItem("session_id", regResponse.session_id);

      /* ✅ Move to next step (UNCHANGED) */
      onNext({
        name,
        email,
        testId,
      });
    } catch (err) {
      console.error("Register failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------- UI (UNCHANGED — NOT TOUCHED) ---------------- */
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        className="max-w-xl w-full"
      >
        <div className="glass-card rounded-3xl p-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <User className="w-6 h-6 text-primary" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-2xl">Basic Details</h2>
              <p className="text-sm text-muted-foreground">
                Here you can check your details
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                disabled
                className="w-full px-4 py-3 rounded-lg bg-input-background border border-border"
              />
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-4 py-3 rounded-lg bg-input-background border border-border"
              />
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                Test ID
              </label>
              <input
                type="text"
                value={testId}
                disabled
                className="w-full px-4 py-3 rounded-lg bg-input-background border border-border"
              />
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-4 bg-primary text-primary-foreground rounded-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? "Saving details..." : "Next"}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
