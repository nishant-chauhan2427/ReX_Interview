import { motion } from 'motion/react';
import { Trophy, Brain, Target, TrendingUp, Clock, Star, Download, Home } from 'lucide-react';

interface Step8ResultsProps {
  onRestart: () => void;
}

export function Step8Results({ onRestart }: Step8ResultsProps) {
  const overallScore = 87;

  const metrics = [
    { icon: Trophy, label: 'Overall Score', value: `${overallScore}%`, color: 'text-primary' },
    { icon: Brain, label: 'Technical Skills', value: '92%', color: 'text-[var(--status-ready)]' },
    { icon: Target, label: 'Problem Solving', value: '85%', color: 'text-secondary' },
    { icon: TrendingUp, label: 'Communication', value: '88%', color: 'text-[var(--status-processing)]' },
  ];

  const detailedScores = [
    { category: 'Technical Knowledge', score: 92, total: 100 },
    { category: 'Problem Solving', score: 85, total: 100 },
    { category: 'Communication Skills', score: 88, total: 100 },
    { category: 'Cultural Fit', score: 82, total: 100 },
    { category: 'Leadership Potential', score: 90, total: 100 },
  ];

  const strengths = [
    'Strong technical foundation and problem-solving abilities',
    'Clear and articulate communication style',
    'Good understanding of industry best practices',
  ];

  const improvements = [
    'Consider adding more real-world project examples',
    'Expand on team collaboration experiences',
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto mb-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring" }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-6 pulse-glow"
          >
            <Trophy className="w-10 h-10 text-primary" strokeWidth={1.5} />
          </motion.div>
          <h1 className="text-4xl mb-3">Interview Results</h1>
          <p className="text-lg text-muted-foreground">Here's your comprehensive performance analysis</p>
        </motion.div>

        {/* Score Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card rounded-2xl p-6 text-center"
              >
                <div className="flex items-center justify-center mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className={`w-6 h-6 ${metric.color}`} strokeWidth={1.5} />
                  </div>
                </div>
                <p className="text-3xl mb-2">{metric.value}</p>
                <p className="text-sm text-muted-foreground">{metric.label}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Detailed Breakdown */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card rounded-2xl p-8"
          >
            <h3 className="text-xl mb-6 flex items-center gap-2">
              <Star className="w-5 h-5 text-primary" strokeWidth={1.5} />
              Detailed Breakdown
            </h3>

            <div className="space-y-5">
              {detailedScores.map((item, index) => (
                <motion.div
                  key={item.category}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">{item.category}</span>
                    <span className="text-sm text-primary">{item.score}%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${item.score}%` }}
                      transition={{ duration: 1, delay: 0.6 + index * 0.1 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* AI Analysis */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card rounded-2xl p-8"
          >
            <h3 className="text-xl mb-6 flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" strokeWidth={1.5} />
              AI Analysis
            </h3>

            <div className="space-y-6">
              {/* Strengths */}
              <div>
                <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--status-ready)]" />
                  Key Strengths
                </p>
                <div className="space-y-2">
                  {strengths.map((strength, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="flex items-start gap-2 text-sm pl-4"
                    >
                      <span className="text-[var(--status-ready)] mt-1">•</span>
                      <span>{strength}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Improvements */}
              <div>
                <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--status-attention)]" />
                  Areas for Growth
                </p>
                <div className="space-y-2">
                  {improvements.map((improvement, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      className="flex items-start gap-2 text-sm pl-4"
                    >
                      <span className="text-[var(--status-attention)] mt-1">•</span>
                      <span>{improvement}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Time Stats */}
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" strokeWidth={1.5} />
                    <span>Total Time</span>
                  </div>
                  <span>23:45</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          {/* <button
            onClick={onRestart}
            className="flex items-center justify-center gap-3 px-8 py-4 rounded-xl border border-border bg-accent/30 hover:border-primary/50 hover:bg-accent/50 transition-all"
          >
            <Home className="w-5 h-5" strokeWidth={1.5} />
            <span>New Interview</span>
          </button> */}

          {/* <button className="flex items-center justify-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all">
            <Download className="w-5 h-5" strokeWidth={1.5} />
            <span>Download Report</span>
          </button> */}
        </motion.div>
      </div>
    </div>
  );
}