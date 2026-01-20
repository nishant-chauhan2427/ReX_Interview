import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface Step1WelcomeProps {
  onNext: () => void;
}

export function Step1Welcome({ onNext }: Step1WelcomeProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full text-center"
      >
        {/* <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="flex items-center justify-center mb-8"
        >
          <img
            src="/VAYUZ-white-logo.png"
            alt="PRAGYAN.AI Logo"
            className="h-28 object-contain"
          />
        </motion.div> */}


        <h1 className="text-5xl mb-6">
          Welcome to <br />RAPYD EXCHANGE
        </h1>

        <p className="text-lg text-muted-foreground mb-12 max-w-xl mx-auto">
          Get ready for an intelligent, automated interview process powered by PRAGYAN AI.
          We'll assess your skills and provide instant feedback.
        </p>

        <motion.button
          onClick={onNext}
          className="mb-12 pointer px-10 py-4 bg-primary text-primary-foreground rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Next
        </motion.button>
        
      </motion.div>


      
    </div>
  );
}
