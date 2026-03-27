import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  Calendar,
  Clock,
  Pill,
  History,
  Settings,
  Info,
  Plus,
  ListTodo,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { useApp } from '../context/AppContext';
import { ConnectionStatusBar } from '../components/ConnectionStatusBar';

interface NavCard {
  id: string;
  title: string;
  icon: React.ReactNode;
  path: string;
  tutorialStep?: number;
}

export function Dashboard() {
  const navigate = useNavigate();
  const { medications, doseHistory, demoMode, darkMode } = useApp();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getNextDose = () => {
    const now = new Date();
    const upcomingDoses = doseHistory
      .filter(dose => dose.status === 'upcoming' && dose.scheduledTime > now)
      .sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime());

    return upcomingDoses[0];
  };

  const nextDose = getNextDose();

  const getTimeUntilDose = () => {
    if (!nextDose) return null;
    const now = new Date();
    const diff = nextDose.scheduledTime.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { hours, minutes };
  };

  const timeUntil = getTimeUntilDose();

  const navCards: NavCard[] = [
    {
      id: 'schedule',
      title: 'Set Schedule',
      icon: <Calendar className="w-7 h-7" strokeWidth={2} />,
      path: '/schedule',
      tutorialStep: 3,
    },
    {
      id: 'upcoming',
      title: 'Upcoming Doses',
      icon: <ListTodo className="w-7 h-7" strokeWidth={2} />,
      path: '/upcoming',
      tutorialStep: 4,
    },
    {
      id: 'dispenser',
      title: 'Dispenser',
      icon: <Pill className="w-7 h-7" strokeWidth={2} />,
      path: '/dispenser',
    },
    {
      id: 'history',
      title: 'History',
      icon: <History className="w-7 h-7" strokeWidth={2} />,
      path: '/history',
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: <Settings className="w-7 h-7" strokeWidth={2} />,
      path: '/settings',
      tutorialStep: 5,
    },
    {
      id: 'system',
      title: 'System Info',
      icon: <Info className="w-7 h-7" strokeWidth={2} />,
      path: '/system-info',
    },
  ];

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className={`h-full w-full flex flex-col ${darkMode ? 'bg-[#1A1A1A]' : 'bg-[#F8F9FA]'}`}>
      <ConnectionStatusBar />

      <div className="flex-1 overflow-auto">
        {/* Hero Section */}
        <div
          className={`px-6 py-8 rounded-b-3xl shadow-lg ${darkMode ? 'bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6]' : 'bg-gradient-to-br from-[#2D5BFF] to-[#4A90E2]'}`}
          data-tutorial-step="1"
        >
          <div className="max-w-md mx-auto">
            {/* Time Display */}
            <div className="text-center mb-6" data-tutorial-step="0">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-mono text-5xl font-bold text-white mb-2 tracking-wider"
              >
                {formatTime(currentTime)}
              </motion.div>
              <p className="text-white/90 text-lg">{formatDate(currentTime)}</p>
            </div>

            {/* Next Dose Widget */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20"
              data-tutorial-step="1"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold text-lg">Next Dose</h3>
                {timeUntil && (
                  <div className="bg-white/20 px-3 py-1 rounded-full">
                    <p className="text-white text-sm font-medium">
                      {timeUntil.hours}h {timeUntil.minutes}m
                    </p>
                  </div>
                )}
              </div>
              
              {nextDose ? (
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-3 rounded-xl">
                    <Pill className="w-6 h-6 text-white" strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium text-lg">
                      {nextDose.medicationName}
                    </p>
                    <p className="text-white/80">
                      {nextDose.scheduledTime.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </p>
                  </div>
                  <div className="w-16 h-16">
                    <svg className="transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="10"
                      />
                      <motion.circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="white"
                        strokeWidth="10"
                        strokeDasharray="283"
                        initial={{ strokeDashoffset: 283 }}
                        animate={{
                          strokeDashoffset: timeUntil
                            ? 283 * (1 - (timeUntil.hours * 60 + timeUntil.minutes) / 1440)
                            : 283,
                        }}
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-white/80">No upcoming doses scheduled</p>
                  <Button
                    onClick={() => navigate('/schedule')}
                    variant="ghost"
                    className="text-white hover:bg-white/20 mt-2"
                  >
                    Set Schedule
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Navigation Grid */}
        <div className="px-6 py-6 max-w-md mx-auto" data-tutorial-step="2">
          <div className="grid grid-cols-2 gap-4">
            {navCards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileTap={{ scale: 0.95 }}
                data-tutorial-step={card.tutorialStep}
              >
                <button
                  onClick={() => navigate(card.path)}
                  className={`w-full rounded-2xl p-6 shadow-sm border transition-all active:scale-95 min-h-[120px] flex flex-col items-center justify-center gap-3 ${darkMode ? 'bg-[#2A2A2A] border-gray-800 hover:bg-gray-800' : 'bg-white border-gray-100 hover:shadow-md'}`}
                >
                  <div className="text-[#2D5BFF]">{card.icon}</div>
                  <p className={`font-semibold text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>{card.title}</p>
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Demo Mode Banner */}
        {demoMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mx-6 mb-6 border rounded-2xl p-4 ${darkMode ? 'bg-[#FF9500]/20 border-[#FF9500]/40' : 'bg-[#FF9500]/10 border-[#FF9500]/30'}`}
          >
            <p className="text-[#FF9500] text-center font-medium">
              Running in Demo Mode
            </p>
            <p className={`text-center text-sm mt-1 ${darkMode ? 'text-[#FF9500]/90' : 'text-[#FF9500]/80'}`}>
              Connect a device to enable full functionality
            </p>
            <Button
              onClick={() => navigate('/ble-scan')}
              variant="ghost"
              className="w-full mt-3 text-[#FF9500] hover:bg-[#FF9500]/20"
            >
              Connect Device
            </Button>
          </motion.div>
        )}
      </div>

      {/* Floating Action Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
        className="absolute bottom-6 right-6"
      >
        <Button
          onClick={() => navigate('/dispenser')}
          className="bg-[#2D5BFF] hover:bg-[#2D5BFF]/90 text-white rounded-full w-16 h-16 shadow-lg hover:shadow-xl transition-shadow"
        >
          <Plus className="w-8 h-8" strokeWidth={2} />
        </Button>
      </motion.div>
    </div>
  );
}