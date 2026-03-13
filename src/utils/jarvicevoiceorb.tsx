import { motion, AnimatePresence } from "motion/react";

interface JarvisQuestionBoxProps {
  questionText: string;
  isSpeaking: boolean;
  onSpeak: () => void;
  disabled?: boolean;
  questionKey?: string; // ✅ flip trigger ke liye
}

export function JarvisQuestionBox({
  questionText,
  isSpeaking,
  onSpeak,
  disabled,
  questionKey,
}: JarvisQuestionBoxProps) {
  return (
    <div style={{ perspective: "1200px" }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={questionKey}
          initial={{ rotateY: 90, opacity: 0, scale: 0.95 }}
          animate={{ rotateY: 0, opacity: 1, scale: 1 }}
          exit={{ rotateY: -90, opacity: 0, scale: 0.95 }}
          transition={{
            duration: 0.45,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{ transformStyle: "preserve-3d", transformOrigin: "center center" }}
        >
          <div
            className="rounded-2xl border overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(8,20,35,0.95) 0%, rgba(6,25,45,0.9) 100%)",
              borderColor: isSpeaking ? "rgba(34,211,238,0.5)" : "rgba(34,211,238,0.15)",
              boxShadow: isSpeaking
                ? "0 0 40px rgba(34,211,238,0.15), 0 0 80px rgba(34,211,238,0.05)"
                : "0 4px 24px rgba(0,0,0,0.4)",
              transition: "border-color 0.4s, box-shadow 0.4s",
            }}
          >
            {/* ── TOP: JARVIS ORB SECTION ── */}
            <div
              className="flex flex-col items-center justify-center py-8 px-6 relative"
              style={{
                borderBottom: "1px solid rgba(34,211,238,0.1)",
                background: "linear-gradient(180deg, rgba(34,211,238,0.03) 0%, transparent 100%)",
              }}
            >
              {/* Corner accents */}
              <div className="absolute top-3 left-4 w-4 h-4 border-t border-l" style={{ borderColor: "rgba(34,211,238,0.3)" }} />
              <div className="absolute top-3 right-4 w-4 h-4 border-t border-r" style={{ borderColor: "rgba(34,211,238,0.3)" }} />

              {/* Orb */}
              <motion.button
                onClick={onSpeak}
                disabled={disabled}
                className="relative flex items-center justify-center mb-4"
                style={{ width: 100, height: 100 }}
                whileHover={!disabled ? { scale: 1.05 } : {}}
                whileTap={!disabled ? { scale: 0.96 } : {}}
              >
                {/* Outer pulse rings */}
                <AnimatePresence>
                  {isSpeaking &&
                    [0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="absolute rounded-full"
                        style={{ border: "1px solid rgba(34,211,238,0.25)" }}
                        initial={{ width: 60, height: 60, opacity: 0.7 }}
                        animate={{ width: 95 + i * 24, height: 95 + i * 24, opacity: 0 }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.55, ease: "easeOut" }}
                        exit={{ opacity: 0 }}
                      />
                    ))}
                </AnimatePresence>

                {/* Spinning arc */}
                <AnimatePresence>
                  {isSpeaking && (
                    <motion.div
                      className="absolute rounded-full"
                      style={{
                        width: 84,
                        height: 84,
                        background: "conic-gradient(from 0deg, transparent 65%, rgba(34,211,238,0.7) 100%)",
                      }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
                      initial={{ opacity: 0 }}
                      exit={{ opacity: 0, transition: { duration: 0.3 } }}
                    />
                  )}
                </AnimatePresence>

                {/* Counter arc */}
                <AnimatePresence>
                  {isSpeaking && (
                    <motion.div
                      className="absolute rounded-full"
                      style={{
                        width: 74,
                        height: 74,
                        background: "conic-gradient(from 180deg, transparent 70%, rgba(34,211,238,0.35) 100%)",
                      }}
                      animate={{ rotate: -360 }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
                      initial={{ opacity: 0 }}
                      exit={{ opacity: 0, transition: { duration: 0.3 } }}
                    />
                  )}
                </AnimatePresence>

                {/* Main orb */}
                <motion.div
                  className="relative z-10 rounded-full flex items-center justify-center"
                  style={{
                    width: 62,
                    height: 62,
                    background: isSpeaking
                      ? "radial-gradient(circle at 35% 30%, rgba(103,232,249,0.9), rgba(6,182,212,0.7), rgba(8,145,178,0.5))"
                      : "radial-gradient(circle at 35% 30%, rgba(30,41,59,1), rgba(15,23,42,0.95))",
                    border: "1.5px solid rgba(34,211,238,0.4)",
                    boxShadow: isSpeaking
                      ? "0 0 24px rgba(34,211,238,0.6), 0 0 48px rgba(34,211,238,0.2), inset 0 1px 0 rgba(255,255,255,0.25)"
                      : "0 0 8px rgba(34,211,238,0.1), inset 0 1px 0 rgba(255,255,255,0.06)",
                    transition: "background 0.4s, box-shadow 0.4s",
                  }}
                  animate={isSpeaking ? { scale: [1, 1.06, 1] } : { scale: 1 }}
                  transition={isSpeaking ? { duration: 0.75, repeat: Infinity, ease: "easeInOut" } : {}}
                >
                  {/* Wave bars */}
                  <div className="flex items-center gap-[3px]">
                    {[0.35, 0.65, 1, 0.65, 0.35].map((h, i) => (
                      <motion.div
                        key={i}
                        className="rounded-full"
                        style={{
                          width: 3,
                          backgroundColor: isSpeaking ? "rgba(255,255,255,0.95)" : "rgba(34,211,238,0.35)",
                        }}
                        animate={
                          isSpeaking
                            ? { height: [h * 10, h * 22, h * 6, h * 20, h * 10] }
                            : { height: Math.round(h * 12) }
                        }
                        transition={
                          isSpeaking
                            ? { duration: 0.45 + i * 0.07, repeat: Infinity, ease: "easeInOut", delay: i * 0.05 }
                            : { duration: 0.3 }
                        }
                      />
                    ))}
                  </div>
                </motion.div>
              </motion.button>

              {/* PAI name */}
              <div className="text-center">
                <motion.p
                  className="font-bold tracking-[0.35em] uppercase"
                  style={{
                    fontSize: 13,
                    color: isSpeaking ? "rgba(34,211,238,1)" : "rgba(34,211,238,0.6)",
                    textShadow: isSpeaking ? "0 0 16px rgba(34,211,238,0.8)" : "none",
                    letterSpacing: "0.35em",
                    transition: "color 0.3s, text-shadow 0.3s",
                  }}
                >
                  PAI<span style={{ textTransform: "none", letterSpacing: "0.1em" }}>(Interviewer)</span>
                </motion.p>
                <motion.p
                  className="text-[10px] tracking-widest mt-0.5"
                  style={{ color: "rgba(100,130,160,0.7)" }}
                  animate={isSpeaking ? { opacity: [0.5, 1, 0.5] } : { opacity: 0.7 }}
                  transition={isSpeaking ? { duration: 1.4, repeat: Infinity } : {}}
                >
                  {isSpeaking ? "SPEAKING" : "TAP TO HEAR"}
                </motion.p>
              </div>

              {/* Scan line */}
              <AnimatePresence>
                {isSpeaking && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-px"
                    style={{
                      background: "linear-gradient(90deg, transparent, rgba(34,211,238,0.6), transparent)",
                    }}
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* ── BOTTOM: QUESTION TEXT ── */}
            <div className="px-6 py-5">
              <p
                className="text-[11px] uppercase tracking-widest mb-2"
                style={{ color: "rgba(34,211,238,0.4)" }}
              >
                Question
              </p>
              <motion.p
                key={questionKey + "-text"}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.35 }}
                className="leading-relaxed"
                style={{ color: "rgba(220,235,255,0.9)", fontSize: 22 }}
              >
                {questionText}
              </motion.p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}