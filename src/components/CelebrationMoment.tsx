// src/components/CelebrationMoment.tsx

"use client";

import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { motion } from "framer-motion";
import { useAnimation } from "@/hooks/useAnimation";
import { DURATIONS, ANIMATION_VARIANTS } from "@/lib/animations";

interface CelebrationMomentProps {
  message: string;
  duration?: number;
  onComplete?: () => void;
  emoji?: string;
  showConfetti?: boolean;
}

export default function CelebrationMoment({
  message,
  duration = 3000,
  onComplete,
  emoji = "🎯",
  showConfetti = true,
}: CelebrationMomentProps) {
  const [isVisible, setIsVisible] = useState(true);
  const animationsEnabled = useAnimation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  if (!isVisible) return null;

  return (
    <>
      {showConfetti && animationsEnabled && typeof window !== 'undefined' && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={100}
          gravity={0.3}
        />
      )}

      <motion.div
        className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
        variants={ANIMATION_VARIANTS.scaleIn}
        initial="initial"
        animate={animationsEnabled ? "animate" : false}
        exit="exit"
        transition={animationsEnabled ? { duration: DURATIONS.normal / 1000 } : { duration: 0 }}
      >
        <div className="bg-white rounded-2xl shadow-2xl px-8 py-6 text-center border-2 border-green-500 max-w-xs sm:max-w-sm" role="status" aria-live="polite">
          <div className="text-5xl mb-4">{emoji}</div>
          <p className="text-xl font-semibold text-gray-900">{message}</p>
        </div>
      </motion.div>
    </>
  );
}
