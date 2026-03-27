import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, Clock, Pill, CheckCircle2, AlertCircle, Circle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useApp } from '../context/AppContext';
import { ConnectionStatusBar } from '../components/ConnectionStatusBar';

export function UpcomingDoses() {
  const navigate = useNavigate();
  const { doseHistory, medications } = useApp();

  const now = new Date();

  const sortedDoses = [...doseHistory].sort(
    (a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime()
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'dispensed':
        return <CheckCircle2 className="w-5 h-5 text-[#34C759]" strokeWidth={2} />;
      case 'missed':
        return <AlertCircle className="w-5 h-5 text-[#FF3B30]" strokeWidth={2} />;
      case 'overdue':
        return <AlertCircle className="w-5 h-5 text-[#FF9500]" strokeWidth={2} />;
      default:
        return <Circle className="w-5 h-5 text-gray-300" strokeWidth={2} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'dispensed':
        return 'bg-[#34C759]/10 border-[#34C759]/30';
      case 'missed':
        return 'bg-[#FF3B30]/10 border-[#FF3B30]/30';
      case 'overdue':
        return 'bg-[#FF9500]/10 border-[#FF9500]/30';
      default:
        return 'bg-white border-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'dispensed':
        return 'Taken';
      case 'missed':
        return 'Missed';
      case 'overdue':
        return 'Overdue';
      default:
        return 'Upcoming';
    }
  };

  const getMedicationColor = (medId: string) => {
    const med = medications.find(m => m.id === medId);
    return med?.color || '#2D5BFF';
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = date.toDateString() === new Date(now.getTime() + 86400000).toDateString();

    if (isToday) return 'Today';
    if (isTomorrow) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const groupByDate = (doses: typeof doseHistory) => {
    const groups: { [key: string]: typeof doseHistory } = {};
    
    doses.forEach(dose => {
      const dateKey = dose.scheduledTime.toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(dose);
    });

    return Object.entries(groups).map(([dateKey, doses]) => ({
      date: new Date(dateKey),
      doses: doses.sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime()),
    }));
  };

  const groupedDoses = groupByDate(sortedDoses);

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
          <h1 className="text-2xl font-bold text-gray-900 flex-1">Upcoming Doses</h1>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="max-w-md mx-auto px-6 py-6">
          {groupedDoses.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <Clock className="w-12 h-12 text-gray-400" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Scheduled Doses
              </h3>
              <p className="text-gray-600 mb-6">
                Set up your medication schedule to get started
              </p>
              <Button
                onClick={() => navigate('/schedule')}
                className="bg-[#2D5BFF] hover:bg-[#2D5BFF]/90 text-white rounded-xl"
              >
                Set Schedule
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {groupedDoses.map((group, groupIndex) => (
                <motion.div
                  key={group.date.toDateString()}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: groupIndex * 0.05 }}
                >
                  {/* Date Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-[2px] flex-1 bg-gray-200" />
                    <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                      {formatDate(group.date)}
                    </h3>
                    <div className="h-[2px] flex-1 bg-gray-200" />
                  </div>

                  {/* Dose Cards */}
                  <div className="space-y-3">
                    {group.doses.map((dose, doseIndex) => (
                      <motion.div
                        key={dose.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (groupIndex * 0.05) + (doseIndex * 0.03) }}
                        className={`rounded-xl border-l-4 p-5 ${getStatusColor(dose.status)} backdrop-blur-sm`}
                      >
                        <div className="flex items-start gap-4">
                          {/* Medication Icon */}
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{
                              backgroundColor: `${getMedicationColor(dose.medicationId)}15`,
                            }}
                          >
                            <Pill
                              className="w-6 h-6"
                              style={{ color: getMedicationColor(dose.medicationId) }}
                              strokeWidth={2}
                            />
                          </div>

                          {/* Medication Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-lg text-gray-900 mb-1">
                              {dose.medicationName}
                            </h4>
                            <div className="flex items-center gap-3 text-sm">
                              <span className="font-mono font-medium text-gray-700">
                                {formatTime(dose.scheduledTime)}
                              </span>
                              <span className="w-1 h-1 rounded-full bg-gray-300" />
                              <span className="text-gray-600">
                                {getStatusText(dose.status)}
                              </span>
                            </div>
                            {dose.dispensedTime && (
                              <p className="text-xs text-gray-500 mt-1">
                                Dispensed at {formatTime(dose.dispensedTime)}
                              </p>
                            )}
                          </div>

                          {/* Status Icon */}
                          <div className="flex-shrink-0">
                            {getStatusIcon(dose.status)}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}