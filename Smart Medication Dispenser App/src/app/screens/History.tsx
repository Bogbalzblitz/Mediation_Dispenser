import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, Download, Filter, Calendar, Pill } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useApp } from '../context/AppContext';
import { ConnectionStatusBar } from '../components/ConnectionStatusBar';
import { toast } from 'sonner';

type FilterType = 'all' | 'dispensed' | 'missed' | 'overdue';

export function History() {
  const navigate = useNavigate();
  const { doseHistory, medications } = useApp();
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredHistory =
    filter === 'all'
      ? doseHistory
      : doseHistory.filter(dose => dose.status === filter);

  const getMedicationColor = (medId: string) => {
    const med = medications.find(m => m.id === medId);
    return med?.color || '#2D5BFF';
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      dispensed: 'bg-[#34C759]/10 text-[#34C759] border-[#34C759]/30',
      missed: 'bg-[#FF3B30]/10 text-[#FF3B30] border-[#FF3B30]/30',
      overdue: 'bg-[#FF9500]/10 text-[#FF9500] border-[#FF9500]/30',
      upcoming: 'bg-gray-100 text-gray-600 border-gray-200',
    };

    return styles[status as keyof typeof styles] || styles.upcoming;
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleExport = () => {
    const csv = [
      ['Date', 'Time', 'Medication', 'Status', 'Dispensed At'].join(','),
      ...doseHistory.map(dose =>
        [
          dose.scheduledTime.toLocaleDateString(),
          dose.scheduledTime.toLocaleTimeString(),
          dose.medicationName,
          dose.status,
          dose.dispensedTime?.toLocaleTimeString() || 'N/A',
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medication-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('History Exported', {
      description: 'Your medication history has been downloaded.',
    });
  };

  const adherenceRate = doseHistory.length > 0
    ? Math.round(
        (doseHistory.filter(d => d.status === 'dispensed').length / doseHistory.length) * 100
      )
    : 0;

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
          <h1 className="text-2xl font-bold text-gray-900 flex-1">History</h1>
          <Button
            onClick={handleExport}
            variant="outline"
            className="rounded-xl"
            disabled={doseHistory.length === 0}
          >
            <Download className="w-5 h-5" strokeWidth={2} />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="max-w-md mx-auto px-6 py-6 space-y-6">
          {/* Stats Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-[#2D5BFF] to-[#4A90E2] rounded-2xl p-6 text-white"
          >
            <h3 className="text-lg font-semibold mb-4">Adherence Rate</h3>
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <div className="text-5xl font-bold mb-2">{adherenceRate}%</div>
                <p className="text-white/80">
                  {doseHistory.filter(d => d.status === 'dispensed').length} of{' '}
                  {doseHistory.length} doses taken
                </p>
              </div>
              <div className="w-24 h-24">
                <svg viewBox="0 0 100 100" className="transform -rotate-90">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="12"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="white"
                    strokeWidth="12"
                    strokeDasharray={`${(adherenceRate / 100) * 251.2} 251.2`}
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </motion.div>

          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { value: 'all', label: 'All' },
              { value: 'dispensed', label: 'Taken' },
              { value: 'missed', label: 'Missed' },
              { value: 'overdue', label: 'Overdue' },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setFilter(value as FilterType)}
                className={`px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
                  filter === value
                    ? 'bg-[#2D5BFF] text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* History List */}
          {filteredHistory.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <Calendar className="w-12 h-12 text-gray-400" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No History</h3>
              <p className="text-gray-600">
                {filter === 'all'
                  ? 'Your medication history will appear here'
                  : `No ${filter} doses found`}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHistory.map((dose, index) => (
                <motion.div
                  key={dose.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: `${getMedicationColor(dose.medicationId)}20`,
                      }}
                    >
                      <Pill
                        className="w-6 h-6"
                        style={{ color: getMedicationColor(dose.medicationId) }}
                        strokeWidth={2}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">
                        {dose.medicationName}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {dose.scheduledTime.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        at{' '}
                        {dose.scheduledTime.toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                        })}
                      </p>
                      {dose.dispensedTime && (
                        <p className="text-xs text-gray-400 mt-1">
                          Taken at{' '}
                          {dose.dispensedTime.toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                          })}
                        </p>
                      )}
                    </div>

                    <div
                      className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadge(
                        dose.status
                      )}`}
                    >
                      {getStatusText(dose.status)}
                    </div>
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
