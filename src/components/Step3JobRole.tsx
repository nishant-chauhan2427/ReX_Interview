import { motion } from 'motion/react';
import { Briefcase, Code, Palette, Users, TrendingUp, Shield } from 'lucide-react';
import { useState } from 'react';

interface Step3JobRoleProps {
  onNext: (role: string) => void;
}

const jobRoles = [
  { id: 'software-engineer', name: 'Software Engineer', icon: Code },
  { id: 'product-manager', name: 'Product Manager', icon: Briefcase },
  { id: 'ux-designer', name: 'UX/UI Designer', icon: Palette },
  { id: 'team-lead', name: 'Team Lead', icon: Users },
  { id: 'data-analyst', name: 'Data Analyst', icon: TrendingUp },
  { id: 'security-engineer', name: 'Security Engineer', icon: Shield },
];

export function Step3JobRole({ onNext }: Step3JobRoleProps) {
  const [selectedRole, setSelectedRole] = useState<string>('');

  const handleNext = () => {
    if (selectedRole) {
      onNext(selectedRole);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        className="max-w-4xl w-full"
      >
        <div className="glass-card rounded-3xl p-10">
          <div className="mb-8">
            <h2 className="text-3xl mb-2">Select Your Job Role</h2>
            <p className="text-muted-foreground">Choose the position you're interviewing for</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {jobRoles.map((role, index) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.id;

              return (
                <motion.button
                  key={role.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedRole(role.id)}
                  className={`
                    relative p-6 rounded-xl border transition-all text-left
                    ${isSelected
                      ? 'border-primary bg-primary/5 glow-border'
                      : 'border-border bg-accent/20 hover:border-primary/30'
                    }
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`
                      w-14 h-14 rounded-xl flex items-center justify-center transition-all
                      ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted/30 text-foreground'}
                    `}>
                      <Icon className="w-7 h-7" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg">{role.name}</h3>
                    </div>
                    {isSelected && (
                      <motion.div
                        layoutId="role-selected"
                        className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>

          <motion.button
            onClick={handleNext}
            disabled={!selectedRole}
            className={`
              w-full px-6 py-4 rounded-xl transition-all
              ${selectedRole
                ? 'bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/20'
                : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
              }
            `}
            whileHover={selectedRole ? { scale: 1.01 } : {}}
            whileTap={selectedRole ? { scale: 0.99 } : {}}
          >
            Next
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
