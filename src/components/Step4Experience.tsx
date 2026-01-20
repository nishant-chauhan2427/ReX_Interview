import { useState } from 'react';
import { motion } from 'motion/react';
import { Award } from 'lucide-react';

interface Step4ExperienceProps {
  onNext: (level: string) => void;
}

const experienceLevels = [
  { id: 'entry', label: 'Entry Level', years: '0-2 years', color: '#10b981' },
  { id: 'intermediate', label: 'Intermediate', years: '2-5 years', color: '#3b82f6' },
  { id: 'senior', label: 'Senior', years: '5-10 years', color: '#8b5cf6' },
  { id: 'expert', label: 'Expert', years: '10+ years', color: '#00d4ff' },
];

export function Step4Experience({ onNext }: Step4ExperienceProps) {
  const [selectedLevel, setSelectedLevel] = useState<string>('');

  const handleNext = () => {
    if (selectedLevel) {
      onNext(selectedLevel);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        className="max-w-3xl w-full"
      >
        <div className="glass-card rounded-3xl p-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Award className="w-6 h-6 text-primary" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-2xl">Experience Level</h2>
              <p className="text-sm text-muted-foreground">Select your professional experience</p>
            </div>
          </div>

          {/* Circular Selector */}
          <div className="flex items-center justify-center mb-12 py-8">
            <div className="relative w-80 h-80">
              {/* Center circle */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                <div className="w-32 h-32 rounded-full glass-card flex items-center justify-center pulse-glow">
                  {selectedLevel ? (
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">Level</p>
                      <p className="text-lg">
                        {experienceLevels.find(l => l.id === selectedLevel)?.label}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center px-4">
                      Select Level
                    </p>
                  )}
                </div>
              </motion.div>

              {/* Level options in a circle */}
              {experienceLevels.map((level, index) => {
                const angle = (index * 360) / experienceLevels.length - 90;
                const radius = 140;
                const x = Math.cos((angle * Math.PI) / 180) * radius;
                const y = Math.sin((angle * Math.PI) / 180) * radius;
                const isSelected = selectedLevel === level.id;

                return (
                  <motion.button
                    key={level.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.1, type: "spring" }}
                    onClick={() => setSelectedLevel(level.id)}
                    className={`
                      absolute top-1/2 left-1/2 w-24 h-24 rounded-full border-2 transition-all
                      flex items-center justify-center
                      ${isSelected
                        ? 'bg-primary/20 border-primary glow-border scale-110'
                        : 'bg-accent/30 border-border hover:border-primary/50'
                      }
                    `}
                    style={{
                      transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                    }}
                    whileHover={{ scale: isSelected ? 1.15 : 1.05 }}
                    whileTap={{ scale: 1 }}
                  >
                    <div className="text-center">
                      <p className={`text-xs mb-1 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                        {level.label}
                      </p>
                      <p className="text-[10px] text-muted-foreground/70">
                        {level.years}
                      </p>
                    </div>
                  </motion.button>
                );
              })}

              {/* Connecting lines */}
              {selectedLevel && experienceLevels.map((level, index) => {
                if (level.id !== selectedLevel) return null;
                const angle = (index * 360) / experienceLevels.length - 90;
                const rotation = angle + 90;

                return (
                  <motion.div
                    key={`line-${level.id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute top-1/2 left-1/2 w-px h-20 bg-gradient-to-b from-primary to-transparent origin-bottom"
                    style={{
                      transform: `translate(-50%, -100%) rotate(${rotation}deg)`,
                    }}
                  />
                );
              })}
            </div>
          </div>

          <motion.button
            onClick={handleNext}
            disabled={!selectedLevel}
            className={`
              w-full px-6 py-4 rounded-xl transition-all
              ${selectedLevel
                ? 'bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/20'
                : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
              }
            `}
            whileHover={selectedLevel ? { scale: 1.01 } : {}}
            whileTap={selectedLevel ? { scale: 0.99 } : {}}
          >
            Next
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
