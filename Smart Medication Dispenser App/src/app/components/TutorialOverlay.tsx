import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowRight, ArrowLeft, PartyPopper } from 'lucide-react';
import { Button } from './ui/button';
import { useApp } from '../context/AppContext';
import confetti from 'canvas-confetti';

interface TutorialStep {
  step: number;
  title: string;
  description: string;
  target?: string; // data-tutorial-step attribute value
  position?: 'center' | 'top' | 'bottom';
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    step: 0,
    title: 'Welcome to MediCare+',
    description: 'Let\'s take a quick tour to help you get started with your smart medication dispenser.',
    position: 'center',
  },
  {
    step: 1,
    title: 'Real-Time Clock & Next Dose',
    description: 'The hero section displays the current time and your next scheduled medication with a countdown.',
    target: '1',
    position: 'bottom',
  },
  {
    step: 2,
    title: 'Navigation Menu',
    description: 'Access all features quickly through these navigation cards.',
    target: '2',
    position: 'top',
  },
  {
    step: 3,
    title: 'Set Your Schedule',
    description: 'Configure medication schedules for each day of the week.',
    target: '3',
    position: 'top',
  },
  {
    step: 4,
    title: 'Upcoming Doses',
    description: 'View your medication timeline and track adherence.',
    target: '4',
    position: 'top',
  },
  {
    step: 5,
    title: 'Settings & Customization',
    description: 'Personalize your experience and manage caregiver access.',
    target: '5',
    position: 'top',
  },
  {
    step: 6,
    title: 'Connection Status',
    description: 'Tap the status bar to view detailed connection information.',
    target: '6',
    position: 'bottom',
  },
  {
    step: 7,
    title: 'All Set!',
    description: 'You\'re ready to start using MediCare+. Never miss a dose again!',
    position: 'center',
  },
];

export function TutorialOverlay() {
  const {
    tutorialActive,
    setTutorialActive,
    currentTutorialStep,
    setCurrentTutorialStep,
    setTutorialCompleted,
    connectionStatus,
  } = useApp();

  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);

  // Filter steps based on connection status
  const steps = TUTORIAL_STEPS.filter(step => {
    if (step.step === 6 && !connectionStatus.connected) return false;
    return true;
  });

  const currentStep = steps.find(s => s.step === currentTutorialStep);

  useEffect(() => {
    if (!tutorialActive || !currentStep?.target) {
      setSpotlightRect(null);
      return;
    }

    const updateSpotlight = () => {
      const element = document.querySelector(`[data-tutorial-step="${currentStep.target}"]`);
      if (element) {
        const rect = element.getBoundingClientRect();
        setSpotlightRect(rect);
      }
    };

    updateSpotlight();
    window.addEventListener('resize', updateSpotlight);
    return () => window.removeEventListener('resize', updateSpotlight);
  }, [tutorialActive, currentStep]);

  const handleNext = () => {
    if (currentTutorialStep < steps.length - 1) {
      const nextStep = steps.findIndex(s => s.step > currentTutorialStep);
      if (nextStep !== -1) {
        setCurrentTutorialStep(steps[nextStep].step);
      }
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentTutorialStep > 0) {
      const prevStep = steps
        .slice()
        .reverse()
        .findIndex(s => s.step < currentTutorialStep);
      if (prevStep !== -1) {
        setCurrentTutorialStep(steps[steps.length - 1 - prevStep].step);
      }
    }
  };

  const handleSkip = () => {
    setTutorialActive(false);
    setTutorialCompleted(true);
  };

  const handleComplete = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    
    setTimeout(() => {
      setTutorialActive(false);
      setTutorialCompleted(true);
    }, 1000);
  };

  if (!tutorialActive || !currentStep) return null;

  const currentIndex = steps.findIndex(s => s.step === currentTutorialStep);
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === steps.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 pointer-events-none"
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60" />

        {/* Spotlight */}
        {spotlightRect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute"
            style={{
              left: spotlightRect.left - 8,
              top: spotlightRect.top - 8,
              width: spotlightRect.width + 16,
              height: spotlightRect.height + 16,
            }}
          >
            <div
              className="w-full h-full rounded-2xl"
              style={{
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6), 0 0 20px 4px rgba(45, 91, 255, 0.5)',
              }}
            />
          </motion.div>
        )}

        {/* Tooltip */}
        <div className="absolute inset-0 flex items-center justify-center p-6 pointer-events-none">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className={`bg-white rounded-2xl shadow-2xl max-w-md w-full pointer-events-auto ${
              currentStep.position === 'top'
                ? 'mt-auto mb-20'
                : currentStep.position === 'bottom'
                ? 'mb-auto mt-20'
                : ''
            }`}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {isLast && (
                    <div className="bg-[#2D5BFF]/10 p-2 rounded-full">
                      <PartyPopper className="w-6 h-6 text-[#2D5BFF]" strokeWidth={2} />
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500 font-medium">
                      Step {currentIndex + 1}/{steps.length}
                    </p>
                    <h3 className="text-xl font-bold text-gray-900 mt-1">
                      {currentStep.title}
                    </h3>
                  </div>
                </div>
                <button
                  onClick={handleSkip}
                  className="text-gray-400 hover:text-gray-600 p-1 -mr-1"
                >
                  <X className="w-6 h-6" strokeWidth={2} />
                </button>
              </div>

              {/* Description */}
              <p className="text-gray-600 mb-6 text-base leading-relaxed">
                {currentStep.description}
              </p>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex gap-1">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        index <= currentIndex ? 'bg-[#2D5BFF]' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center gap-3">
                {!isFirst && (
                  <Button
                    onClick={handleBack}
                    variant="outline"
                    className="flex-1 min-h-[48px] rounded-xl"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" strokeWidth={2} />
                    Back
                  </Button>
                )}
                <Button
                  onClick={handleNext}
                  className="flex-1 bg-[#2D5BFF] hover:bg-[#2D5BFF]/90 text-white min-h-[48px] rounded-xl"
                >
                  {isLast ? 'Get Started' : 'Next'}
                  {!isLast && <ArrowRight className="w-5 h-5 ml-2" strokeWidth={2} />}
                </Button>
              </div>

              {!isLast && (
                <button
                  onClick={handleSkip}
                  className="w-full text-center text-gray-500 hover:text-gray-700 mt-4 text-sm"
                >
                  Skip Tutorial
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
