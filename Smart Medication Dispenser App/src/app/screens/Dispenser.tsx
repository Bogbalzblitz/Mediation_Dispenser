import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, Pill, Play, Pause, Clock, Bell, BellOff } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useApp } from '../context/AppContext';
import { ConnectionStatusBar } from '../components/ConnectionStatusBar';
import { toast } from 'sonner';

export function Dispenser() {
  const navigate = useNavigate();
  const { demoMode, medications, doseHistory, addDoseRecord } = useApp();
  const [dispensing, setDispensing] = useState(false);
  const [paused, setPaused] = useState(false);
  const [snoozed, setSnoozed] = useState(false);

  const handleDispenseNow = () => {
    if (demoMode) {
      toast.warning('Demo Mode', {
        description: 'Connect a device to dispense medications.',
      });
      return;
    }

    setDispensing(true);

    // Simulate dispensing
    setTimeout(() => {
      setDispensing(false);
      
      // Find next upcoming dose
      const nextDose = doseHistory.find(d => d.status === 'upcoming');
      if (nextDose) {
        addDoseRecord({
          ...nextDose,
          dispensedTime: new Date(),
          status: 'dispensed',
        });
      }

      toast.success('Medication Dispensed', {
        description: 'Your medication has been dispensed successfully.',
      });
    }, 3000);
  };

  const handlePause = () => {
    setPaused(!paused);
    toast.info(paused ? 'Dispenser Resumed' : 'Dispenser Paused', {
      description: paused
        ? 'Automatic dispensing has been resumed.'
        : 'Automatic dispensing has been paused.',
    });
  };

  const handleSnooze = (minutes: number) => {
    setSnoozed(true);
    toast.info(`Snoozed for ${minutes} minutes`, {
      description: 'You will be reminded again shortly.',
    });

    setTimeout(() => {
      setSnoozed(false);
    }, minutes * 60000);
  };

  const getNextDose = () => {
    const now = new Date();
    return doseHistory
      .filter(dose => dose.status === 'upcoming' && dose.scheduledTime > now)
      .sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime())[0];
  };

  const nextDose = getNextDose();

  return (
    <div className="h-full w-full flex flex-col bg-[#F8F9FA]">
      <ConnectionStatusBar />

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" strokeWidth={2} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 flex-1">Dispenser Control</h1>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="max-w-md mx-auto px-6 py-6 space-y-6">
          {/* Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-[#2D5BFF] to-[#4A90E2] rounded-2xl p-6 text-white"
          >
            <div className="text-center mb-6">
              <motion.div
                animate={dispensing ? { rotate: 360 } : {}}
                transition={{ duration: 2, repeat: dispensing ? Infinity : 0, ease: 'linear' }}
                className="bg-white/20 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center"
              >
                <Pill className="w-12 h-12 text-white" strokeWidth={2} />
              </motion.div>
              <h2 className="text-2xl font-bold mb-2">
                {dispensing ? 'Dispensing...' : paused ? 'Paused' : 'Ready'}
              </h2>
              <p className="text-white/90">
                {dispensing
                  ? 'Please wait while medication is being dispensed'
                  : paused
                  ? 'Automatic dispensing is paused'
                  : 'Dispenser is ready to use'}
              </p>
            </div>

            {nextDose && !dispensing && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm mb-1">Next Dose</p>
                    <p className="text-xl font-semibold">{nextDose.medicationName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/80 text-sm mb-1">Scheduled</p>
                    <p className="font-mono text-lg">
                      {nextDose.scheduledTime.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Quick Actions */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 text-lg mb-3">Quick Actions</h3>

            <Button
              onClick={handleDispenseNow}
              disabled={dispensing}
              className="w-full bg-[#34C759] hover:bg-[#34C759]/90 text-white rounded-xl min-h-[56px] text-lg font-semibold disabled:opacity-50"
            >
              <Play className="w-6 h-6 mr-2" strokeWidth={2} />
              Dispense Now
            </Button>

            <Button
              onClick={handlePause}
              variant="outline"
              className="w-full rounded-xl min-h-[56px] text-lg font-semibold border-2"
            >
              {paused ? (
                <>
                  <Play className="w-6 h-6 mr-2" strokeWidth={2} />
                  Resume Schedule
                </>
              ) : (
                <>
                  <Pause className="w-6 h-6 mr-2" strokeWidth={2} />
                  Pause Schedule
                </>
              )}
            </Button>
          </div>

          {/* Snooze Options */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 text-lg mb-3">Snooze</h3>
            
            <div className="grid grid-cols-3 gap-3">
              {[5, 10, 15].map(minutes => (
                <Button
                  key={minutes}
                  onClick={() => handleSnooze(minutes)}
                  disabled={snoozed}
                  variant="outline"
                  className="rounded-xl h-16 flex flex-col items-center justify-center gap-1 disabled:opacity-50"
                >
                  <Clock className="w-5 h-5" strokeWidth={2} />
                  <span className="text-sm font-semibold">{minutes}m</span>
                </Button>
              ))}
            </div>

            {snoozed && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#FF9500]/10 border border-[#FF9500]/30 rounded-xl p-3 text-center"
              >
                <p className="text-[#FF9500] font-medium flex items-center justify-center gap-2">
                  <BellOff className="w-4 h-4" strokeWidth={2} />
                  Reminders Snoozed
                </p>
              </motion.div>
            )}
          </div>

          {/* Active Medications */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 text-lg mb-3">Active Medications</h3>
            
            <div className="space-y-2">
              {medications.filter(m => m.enabled).map((med, index) => (
                <motion.div
                  key={med.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${med.color}20` }}
                  >
                    <Pill className="w-5 h-5" style={{ color: med.color }} strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{med.name}</p>
                    <p className="text-sm text-gray-500">
                      {Object.keys(med.schedule).length} scheduled days
                    </p>
                  </div>
                  <Bell className="w-5 h-5 text-[#2D5BFF]" strokeWidth={2} />
                </motion.div>
              ))}

              {medications.filter(m => m.enabled).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No active medications</p>
                  <Button
                    onClick={() => navigate('/schedule')}
                    variant="ghost"
                    className="mt-2"
                  >
                    Set Schedule
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
