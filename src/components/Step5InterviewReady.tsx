import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Sparkles, ThumbsUp } from 'lucide-react';

interface Step5InterviewReadyProps {
  onNext: () => void;
}

export function Step5InterviewReady({ onNext }: Step5InterviewReadyProps) {
  const [showMessage, setShowMessage] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);

  const handleStart = () => {
    setShowMessage(false);
    setCountdown(3);
  };

  useEffect(() => {
    if (countdown === null) return;

    if (countdown === 0) {
      setTimeout(() => {
        onNext();
      }, 500);
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, onNext]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full"
      >
        <AnimatePresence mode="wait">
          {showMessage ? (
            <motion.div
              key="ready-message"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-card rounded-3xl p-12 text-center"
            >
              {/* Icon */}
              <motion.div
                className="w-24 h-24 none mx-auto mb-8 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center relative overflow-hidden"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(0, 212, 255, 0.2)',
                    '0 0 40px rgba(0, 212, 255, 0.4)',
                    '0 0 20px rgba(0, 212, 255, 0.2)',
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <ThumbsUp className="w-12 h-12 text-secondary" strokeWidth={1.5} />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"
                  animate={{
                    opacity: [0.3, 0.8, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>

              {/* Message */}
              <motion.h2
                className="text-3xl mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                You’re all set to begin your interview
              </motion.h2>

              <motion.p
                className="text-muted-foreground mb-10 max-w-md mx-auto"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                All systems are ready and functioning correctly. Click Continue to proceed with the interview questions.
              </motion.p>

              {/* Continue Button */}
              <motion.button
                onClick={handleStart}
                className="px-8 py-4 bg-primary text-primary-foreground rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all inline-flex items-center gap-3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Play className="w-5 h-5" />
                Continue
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="countdown"
              initial={{ opacity: 0, scale: 1.2 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-center"
            >
              <AnimatePresence mode="wait">
                {countdown !== null && countdown > 0 && (
                  <motion.div
                    key={countdown}
                    initial={{ opacity: 0, scale: 0.5, y: -50 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1, 
                      y: 0,
                    }}
                    exit={{ 
                      opacity: 0, 
                      scale: 1.5, 
                      y: 50,
                    }}
                    transition={{
                      duration: 0.5,
                      ease: "easeOut",
                    }}
                    className="relative"
                  >
                    {/* Countdown Number */}
                    <div className="relative inline-block">
                      <motion.div
                        className="text-[12rem] font-bold bg-gradient-to-br from-primary via-secondary to-primary bg-clip-text text-transparent"
                        animate={{
                          filter: [
                            'drop-shadow(0 0 20px rgba(0, 212, 255, 0.5))',
                            'drop-shadow(0 0 40px rgba(0, 212, 255, 0.8))',
                            'drop-shadow(0 0 20px rgba(0, 212, 255, 0.5))',
                          ],
                        }}
                        transition={{
                          duration: 0.8,
                        }}
                      >
                        {countdown}
                      </motion.div>

                      {/* Pulse ring */}
                      <motion.div
                        className="absolute inset-0 rounded-full border-4 border-primary/30"
                        initial={{ scale: 0.8, opacity: 1 }}
                        animate={{ scale: 2, opacity: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
