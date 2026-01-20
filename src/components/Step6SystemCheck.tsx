import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mic, Video, Volume2, CheckCircle2, XCircle } from 'lucide-react';

interface Step6SystemCheckProps {
  onNext: () => void;
}

type CheckStatus = 'checking' | 'success' | 'failed';

interface SystemCheck {
  id: string;
  label: string;
  icon: typeof Mic;
  status: CheckStatus;
}

export function Step6SystemCheck({ onNext }: Step6SystemCheckProps) {
  const [checks, setChecks] = useState<SystemCheck[]>([
    { id: 'microphone', label: 'Microphone Access', icon: Mic, status: 'checking' },
    { id: 'camera', label: 'Camera Access', icon: Video, status: 'checking' },
    { id: 'audio', label: 'Audio Output', icon: Volume2, status: 'checking' },
  ]);

  const [currentCheck, setCurrentCheck] = useState(0);
  const [canProceed, setCanProceed] = useState(false);

  useEffect(() => {
    // Simulate system checks
    const timer = setInterval(() => {
      setCurrentCheck(prev => {
        if (prev < checks.length) {
          setChecks(current => 
            current.map((check, index) => {
              if (index === prev) {
                return { ...check, status: 'success' as CheckStatus };
              }
              return check;
            })
          );
          return prev + 1;
        }
        return prev;
      });
    }, 1500);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const allChecked = checks.every(check => check.status === 'success');
    if (allChecked) {
      setTimeout(() => setCanProceed(true), 500);
    }
  }, [checks]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full"
      >
        <div className="glass-card rounded-3xl p-10">
          <div className="text-center mb-10">
            <h2 className="text-2xl mb-2">System Check</h2>
            <p className="text-muted-foreground">
              Verifying your device setup for the interview
            </p>
          </div>

          {/* Camera Preview Area */}
          <div className="relative mb-8 rounded-2xl overflow-hidden bg-muted/20 aspect-video flex items-center justify-center border border-border">
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5"
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <div className="relative z-10 text-center">
              <Video className="w-16 h-16 text-muted-foreground mx-auto mb-4" strokeWidth={1} />
              <p className="text-sm text-muted-foreground">Camera preview simulation</p>
            </div>

            {/* Scan line effect */}
            <div className="scan-line absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
          </div>

          {/* System Checks */}
          <div className="space-y-4 mb-8">
            {checks.map((check, index) => {
              const Icon = check.icon;
              const isChecking = check.status === 'checking';
              const isSuccess = check.status === 'success';
              const isFailed = check.status === 'failed';

              return (
                <motion.div
                  key={check.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-xl border border-border bg-accent/20"
                >
                  <div className="flex items-center gap-4">
                    <div className={`
                      w-12 h-12 rounded-lg flex items-center justify-center
                      ${isSuccess ? 'bg-[var(--status-ready)]/10' : 'bg-muted/30'}
                    `}>
                      <Icon 
                        className={`w-6 h-6 ${isSuccess ? 'text-[var(--status-ready)]' : 'text-muted-foreground'}`}
                        strokeWidth={1.5}
                      />
                    </div>
                    <span>{check.label}</span>
                  </div>

                  <div>
                    {isChecking && (
                      <motion.div
                        className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                    )}
                    {isSuccess && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring" }}
                      >
                        <CheckCircle2 className="w-6 h-6 text-[var(--status-ready)]" strokeWidth={2} />
                      </motion.div>
                    )}
                    {isFailed && (
                      <XCircle className="w-6 h-6 text-destructive" strokeWidth={2} />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Status Message */}
          <AnimatePresence mode="wait">
            {!canProceed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center mb-6"
              >
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                  <motion.span
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    Performing system checks...
                  </motion.span>
                </p>
              </motion.div>
            )}
            {canProceed && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-6"
              >
                <p className="text-sm text-[var(--status-ready)] flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                  All systems ready
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            onClick={onNext}
            disabled={!canProceed}
            className={`
              w-full px-6 py-4 rounded-xl transition-all
              ${canProceed
                ? 'bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/20'
                : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
              }
            `}
            whileHover={canProceed ? { scale: 1.01 } : {}}
            whileTap={canProceed ? { scale: 0.99 } : {}}
          >
            {canProceed ? 'Start Interview' : 'Please wait...'}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

function AnimatePresence({ children, mode }: { children: React.ReactNode; mode?: string }) {
  return <>{children}</>;
}
