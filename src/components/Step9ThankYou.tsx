import { motion } from 'motion/react';
import { Heart, Mail, Share2 } from 'lucide-react';

interface Step9ThankYouProps {
  onRestart: () => void;
}

export function Step9ThankYou({ onRestart }: Step9ThankYouProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full text-center"
      >
        <div className="glass-card rounded-3xl p-12">
          {/* Heart Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-primary/10 mb-8"
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Heart className="w-12 h-12 text-primary" strokeWidth={1.5} fill="currentColor" />
            </motion.div>
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h1 className="text-4xl mb-4">Thank You!</h1>
            <p className="text-lg text-muted-foreground mb-8">
              We appreciate you taking the time to complete this AI-powered interview.<br />
              Your detailed report has been sent to your email.
            </p>
          </motion.div>

          {/* Info Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid md:grid-cols-2 gap-4 mb-10"
          >
            <div className="p-6 rounded-xl border border-border bg-accent/20 text-left">
              <Mail className="w-6 h-6 text-primary mb-3" strokeWidth={1.5} />
              <p className="text-sm mb-1">Report Sent</p>
              <p className="text-xs text-muted-foreground">
                Check your inbox for the detailed analysis
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border bg-accent/20 text-left">
              <Share2 className="w-6 h-6 text-secondary mb-3" strokeWidth={1.5} />
              <p className="text-sm mb-1">Share Results</p>
              <p className="text-xs text-muted-foreground">
                Share your achievements with employers
              </p>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="space-y-3"
          >
            <button
              onClick={onRestart}
              className="w-full px-8 py-4 bg-primary text-primary-foreground rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all"
            >
              Start Another Interview
            </button>
            <p className="text-xs text-muted-foreground">
              Practice makes perfect! Take another interview to improve your skills.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
