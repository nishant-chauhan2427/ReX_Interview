import { motion } from 'motion/react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="fixed left-8 top-1/2 -translate-y-1/2 z-50 lg:block">
      <div className="flex flex-col gap-3">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => {
          const isActive = step === currentStep;
          const isPast = step < currentStep;
          
          return (
            <div key={step} className="flex items-center gap-3">
              <motion.div
                className={`
                  relative w-8 h-8 rounded-full flex items-center justify-center text-xs
                  ${isActive 
                    ? 'bg-primary text-primary-foreground glow-border' 
                    : isPast
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'bg-muted/20 text-muted-foreground border border-border'
                  }
                `}
                initial={false}
                animate={{
                  scale: isActive ? 1.1 : 1,
                }}
                transition={{ duration: 0.3 }}
              >
                {isPast ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span>{step}</span>
                )}
                
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-primary"
                    initial={{ scale: 1, opacity: 1 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </motion.div>
              
              {step < totalSteps && (
                <div className={`
                  w-px h-8
                  ${step < currentStep ? 'bg-primary/30' : 'bg-border'}
                `} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
