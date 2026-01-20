import { useState } from 'react';
import { motion } from 'motion/react';
import { Settings2 } from 'lucide-react';

interface Step5PreferencesProps {
  onNext: (preferences: string[]) => void;
}

const questionCategories = [
  { id: 'technical', label: 'Technical Skills', description: 'Coding, architecture, and problem-solving' },
  { id: 'behavioral', label: 'Behavioral', description: 'Teamwork, communication, and soft skills' },
  { id: 'situational', label: 'Situational', description: 'Real-world scenarios and decision-making' },
  { id: 'leadership', label: 'Leadership', description: 'Management and team guidance' },
  { id: 'cultural', label: 'Cultural Fit', description: 'Values, work style, and team dynamics' },
  { id: 'domain', label: 'Domain Knowledge', description: 'Industry-specific expertise' },
];

export function Step5Preferences({ onNext }: Step5PreferencesProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleSelection = (id: string) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleNext = () => {
    if (selected.length > 0) {
      onNext(selected);
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
              <Settings2 className="w-6 h-6 text-primary" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-2xl">Question Preferences</h2>
              <p className="text-sm text-muted-foreground">Select categories you want to focus on</p>
            </div>
          </div>

          <div className="space-y-3 mb-8">
            {questionCategories.map((category, index) => {
              const isSelected = selected.includes(category.id);

              return (
                <motion.button
                  key={category.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => toggleSelection(category.id)}
                  className={`
                    w-full p-5 rounded-xl border transition-all text-left
                    ${isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-accent/20 hover:border-primary/30'
                    }
                  `}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`
                      w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all
                      ${isSelected
                        ? 'border-primary bg-primary'
                        : 'border-border bg-transparent'
                      }
                    `}>
                      {isSelected && (
                        <motion.svg
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-4 h-4 text-primary-foreground"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </motion.svg>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="mb-1">{category.label}</h3>
                      <p className="text-xs text-muted-foreground">{category.description}</p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              {selected.length} {selected.length === 1 ? 'category' : 'categories'} selected
            </p>
            {selected.length > 0 && (
              <button
                onClick={() => setSelected([])}
                className="text-sm text-primary hover:underline"
              >
                Clear all
              </button>
            )}
          </div>

          <motion.button
            onClick={handleNext}
            disabled={selected.length === 0}
            className={`
              w-full px-6 py-4 rounded-xl transition-all
              ${selected.length > 0
                ? 'bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/20'
                : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
              }
            `}
            whileHover={selected.length > 0 ? { scale: 1.01 } : {}}
            whileTap={selected.length > 0 ? { scale: 0.99 } : {}}
          >
            Next
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
