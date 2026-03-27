import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, Clock, Plus, Save, Pill, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';
import { ConnectionStatusBar } from '../components/ConnectionStatusBar';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_ABBR: { [key: string]: string } = {
  Monday: 'M',
  Tuesday: 'T',
  Wednesday: 'W',
  Thursday: 'T',
  Friday: 'F',
  Saturday: 'S',
  Sunday: 'S',
};

const MED_COLORS = [
  '#2D5BFF',
  '#FF9500',
  '#34C759',
  '#AF52DE',
  '#FF3B30',
  '#00C7BE',
];

export function SetSchedule() {
  const navigate = useNavigate();
  const { medications, updateMedication, demoMode, darkMode } = useApp();
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [expandedMed, setExpandedMed] = useState<string | null>(null);
  const [editingMed, setEditingMed] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [selectedMultiDays, setSelectedMultiDays] = useState<{ [medId: string]: string[] }>({});
  const [multiDayTime, setMultiDayTime] = useState<{ [medId: string]: string }>({});

  const handleTimeChange = (medId: string, day: string, time: string) => {
    const med = medications.find(m => m.id === medId);
    if (!med) return;

    updateMedication(medId, {
      schedule: {
        ...med.schedule,
        [day]: time,
      },
    });
  };

  const handleToggle = (medId: string) => {
    const med = medications.find(m => m.id === medId);
    if (!med) return;

    updateMedication(medId, {
      enabled: !med.enabled,
    });
  };

  const handleSave = () => {
    if (demoMode) {
      toast.warning('Demo Mode', {
        description: 'Changes saved locally. Connect a device to sync.',
      });
    } else {
      toast.success('Schedule Saved', {
        description: 'Your medication schedule has been updated.',
      });
    }
  };

  const handleEditMedication = (medId: string) => {
    const med = medications.find(m => m.id === medId);
    if (!med) return;

    setEditingMed(medId);
    setEditName(med.name);
    setEditColor(med.color);
  };

  const handleSaveEdit = () => {
    if (!editingMed) return;

    updateMedication(editingMed, {
      name: editName,
      color: editColor,
    });

    setEditingMed(null);
    toast.success('Medication Updated');
  };

  const toggleMultiDaySelection = (medId: string, day: string) => {
    setSelectedMultiDays(prev => {
      const currentDays = prev[medId] || [];
      if (currentDays.includes(day)) {
        return { ...prev, [medId]: currentDays.filter(d => d !== day) };
      } else {
        return { ...prev, [medId]: [...currentDays, day] };
      }
    });
  };

  const handleApplyToMultipleDays = (medId: string) => {
    const med = medications.find(m => m.id === medId);
    const time = multiDayTime[medId];
    const days = selectedMultiDays[medId] || [];

    if (!med || !time || days.length === 0) {
      toast.error('Please select days and time');
      return;
    }

    const newSchedule = { ...med.schedule };
    days.forEach(day => {
      newSchedule[day] = time;
    });

    updateMedication(medId, { schedule: newSchedule });

    toast.success(`Applied to ${days.length} day${days.length > 1 ? 's' : ''}`);
    
    // Reset selections
    setSelectedMultiDays(prev => ({ ...prev, [medId]: [] }));
    setMultiDayTime(prev => ({ ...prev, [medId]: '' }));
  };

  const getMedicationForDay = (day: string) => {
    return medications.map(med => ({
      ...med,
      timeForDay: med.schedule[day] || null,
    }));
  };

  const meds = getMedicationForDay(selectedDay);

  return (
    <div className={`h-full w-full flex flex-col ${darkMode ? 'bg-[#1A1A1A]' : 'bg-[#F8F9FA]'}`}>
      <ConnectionStatusBar />

      {/* Header */}
      <div className={`border-b px-6 py-4 ${darkMode ? 'bg-[#2A2A2A] border-gray-800' : 'bg-white border-gray-100'}`}>
        <div className="max-w-md mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className={`p-2 rounded-full transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <ArrowLeft className={`w-6 h-6 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`} strokeWidth={2} />
          </button>
          <h1 className={`text-2xl font-bold flex-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Set Schedule</h1>
        </div>
      </div>

      <div className="flex-1 overflow-auto pb-6">
        <div className="max-w-md mx-auto px-6 py-6">
          {/* Day Selector */}
          <div className={`rounded-2xl p-4 shadow-sm border mb-6 ${darkMode ? 'bg-[#2A2A2A] border-gray-800' : 'bg-white border-gray-100'}`}>
            <div className="flex gap-2 overflow-x-auto">
              {DAYS.map(day => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`flex-shrink-0 w-12 h-12 rounded-xl font-semibold transition-all ${
                    selectedDay === day
                      ? 'bg-[#2D5BFF] text-white shadow-md scale-105'
                      : darkMode 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {DAY_ABBR[day]}
                </button>
              ))}
            </div>
            <p className={`text-center text-sm mt-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{selectedDay}</p>
          </div>

          {/* Medication Cards */}
          <div className="space-y-4">
            {meds.map((med, index) => (
              <motion.div
                key={med.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`rounded-2xl shadow-sm border overflow-hidden ${darkMode ? 'bg-[#2A2A2A] border-gray-800' : 'bg-white border-gray-100'}`}
              >
                <div className="p-5">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${med.color}20` }}
                    >
                      <Pill className="w-6 h-6" style={{ color: med.color }} strokeWidth={2} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold text-lg truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {med.name}
                      </h3>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {med.timeForDay || 'Not set'}
                      </p>
                    </div>

                    <Switch
                      checked={med.enabled}
                      onCheckedChange={() => handleToggle(med.id)}
                    />

                    <button
                      onClick={() =>
                        setExpandedMed(expandedMed === med.id ? null : med.id)
                      }
                      className={`p-2 rounded-full transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                      {expandedMed === med.id ? (
                        <ChevronUp className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} strokeWidth={2} />
                      ) : (
                        <ChevronDown className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} strokeWidth={2} />
                      )}
                    </button>
                  </div>

                  {/* Expanded Content */}
                  {expandedMed === med.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className={`mt-4 pt-4 border-t space-y-4 ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}
                    >
                      <div>
                        <Label className={`text-sm mb-2 block ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Time for {selectedDay}
                        </Label>
                        <div className="relative">
                          <Clock
                            className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}
                            strokeWidth={2}
                          />
                          <Input
                            type="time"
                            value={med.timeForDay || ''}
                            onChange={(e) =>
                              handleTimeChange(med.id, selectedDay, e.target.value)
                            }
                            className={`pl-12 h-12 rounded-xl ${darkMode ? 'bg-[#1A1A1A] border-gray-700 text-white' : ''}`}
                          />
                        </div>
                      </div>

                      {/* Quick Schedule for Multiple Days */}
                      <div className={`rounded-xl p-4 ${darkMode ? 'bg-[#1A1A1A]/50 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
                        <Label className={`text-sm mb-3 block ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Quick Schedule - Set Multiple Days
                        </Label>
                        
                        <div className="flex gap-2 overflow-x-auto mb-3 pb-1">
                          {DAYS.map(day => {
                            const isSelected = (selectedMultiDays[med.id] || []).includes(day);
                            return (
                              <button
                                key={day}
                                onClick={() => toggleMultiDaySelection(med.id, day)}
                                className={`flex-shrink-0 w-10 h-10 rounded-lg text-sm font-medium transition-all flex items-center justify-center ${
                                  isSelected
                                    ? 'bg-[#2D5BFF] text-white shadow-md'
                                    : darkMode
                                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
                                }`}
                              >
                                {DAY_ABBR[day]}
                              </button>
                            );
                          })}
                        </div>

                        <div className="relative mb-3">
                          <Clock
                            className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}
                            strokeWidth={2}
                          />
                          <Input
                            type="time"
                            value={multiDayTime[med.id] || ''}
                            onChange={(e) =>
                              setMultiDayTime(prev => ({ ...prev, [med.id]: e.target.value }))
                            }
                            placeholder="Select time"
                            className={`pl-10 h-10 rounded-lg text-sm ${darkMode ? 'bg-[#1A1A1A] border-gray-700 text-white' : ''}`}
                          />
                        </div>

                        <Button
                          onClick={() => handleApplyToMultipleDays(med.id)}
                          disabled={!multiDayTime[med.id] || (selectedMultiDays[med.id] || []).length === 0}
                          className={`w-full h-10 rounded-lg text-sm ${
                            !multiDayTime[med.id] || (selectedMultiDays[med.id] || []).length === 0
                              ? 'opacity-50 cursor-not-allowed'
                              : ''
                          } bg-[#34C759] hover:bg-[#34C759]/90 text-white`}
                        >
                          Apply to {(selectedMultiDays[med.id] || []).length || 0} Selected Day{(selectedMultiDays[med.id] || []).length !== 1 ? 's' : ''}
                        </Button>
                      </div>

                      <Button
                        onClick={() => handleEditMedication(med.id)}
                        variant="outline"
                        className={`w-full rounded-xl h-12 ${darkMode ? 'border-gray-700 text-white hover:bg-gray-800' : ''}`}
                      >
                        Edit Medication Details
                      </Button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed Save Button at Bottom */}
      <div className={`border-t px-6 py-4 ${darkMode ? 'bg-[#2A2A2A] border-gray-800' : 'bg-white border-gray-100'}`}>
        <div className="max-w-md mx-auto flex justify-center">
          <Button
            onClick={handleSave}
            className="bg-[#2D5BFF] hover:bg-[#2D5BFF]/90 text-white rounded-xl min-h-[56px] px-8"
          >
            <Save className="w-5 h-5 mr-2" strokeWidth={2} />
            Save Schedule
          </Button>
        </div>
      </div>

      {/* Edit Modal */}
      {editingMed && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-6 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`rounded-2xl p-6 max-w-md w-full ${darkMode ? 'bg-[#2A2A2A]' : 'bg-white'}`}
          >
            <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Edit Medication
            </h2>

            <div className="space-y-4 mb-6">
              <div>
                <Label className={`mb-2 block ${darkMode ? 'text-gray-300' : ''}`}>Medication Name</Label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter medication name"
                  className={`h-12 rounded-xl ${darkMode ? 'bg-[#1A1A1A] border-gray-700 text-white placeholder:text-gray-500' : ''}`}
                />
              </div>

              <div>
                <Label className={`mb-2 block ${darkMode ? 'text-gray-300' : ''}`}>Color</Label>
                <div className="grid grid-cols-6 gap-2">
                  {MED_COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setEditColor(color)}
                      className={`w-full aspect-square rounded-xl transition-all ${
                        editColor === color
                          ? 'ring-4 ring-offset-2 ring-gray-400 scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setEditingMed(null)}
                variant="outline"
                className={`flex-1 h-12 rounded-xl ${darkMode ? 'border-gray-700 text-white hover:bg-gray-800' : ''}`}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                className="flex-1 bg-[#2D5BFF] hover:bg-[#2D5BFF]/90 text-white h-12 rounded-xl"
              >
                Save
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}