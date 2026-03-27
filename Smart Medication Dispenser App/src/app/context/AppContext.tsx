import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Medication {
  id: string;
  name: string;
  color: string;
  enabled: boolean;
  schedule: { [day: string]: string }; // day: time (e.g., "Monday": "08:00")
}

export interface DoseRecord {
  id: string;
  medicationId: string;
  medicationName: string;
  scheduledTime: Date;
  dispensedTime?: Date;
  status: 'upcoming' | 'dispensed' | 'missed' | 'overdue';
}

export interface ConnectionStatus {
  connected: boolean;
  deviceName?: string;
  wifiConnected: boolean;
  mqttConnected: boolean;
  lastSync?: Date;
}

interface AppContextType {
  // Tutorial
  tutorialCompleted: boolean;
  setTutorialCompleted: (completed: boolean) => void;
  tutorialActive: boolean;
  setTutorialActive: (active: boolean) => void;
  currentTutorialStep: number;
  setCurrentTutorialStep: (step: number) => void;

  // Connection
  connectionStatus: ConnectionStatus;
  setConnectionStatus: (status: ConnectionStatus) => void;
  demoMode: boolean;
  setDemoMode: (demo: boolean) => void;

  // Medications
  medications: Medication[];
  setMedications: (meds: Medication[]) => void;
  updateMedication: (id: string, updates: Partial<Medication>) => void;
  
  // Doses
  doseHistory: DoseRecord[];
  addDoseRecord: (record: DoseRecord) => void;
  
  // Settings
  caregiverEnabled: boolean;
  setCaregiverEnabled: (enabled: boolean) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  darkMode: boolean;
  setDarkMode: (enabled: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [tutorialCompleted, setTutorialCompleted] = useState(false);
  const [tutorialActive, setTutorialActive] = useState(false);
  const [currentTutorialStep, setCurrentTutorialStep] = useState(0);
  
  const [demoMode, setDemoMode] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    wifiConnected: false,
    mqttConnected: false,
  });

  const [medications, setMedications] = useState<Medication[]>([
    {
      id: '1',
      name: 'Aspirin',
      color: '#2D5BFF',
      enabled: true,
      schedule: { Monday: '08:00', Wednesday: '08:00', Friday: '08:00' },
    },
    {
      id: '2',
      name: 'Vitamin D',
      color: '#FF9500',
      enabled: true,
      schedule: { Monday: '12:00', Tuesday: '12:00', Wednesday: '12:00', Thursday: '12:00', Friday: '12:00' },
    },
    {
      id: '3',
      name: 'Blood Pressure Med',
      color: '#34C759',
      enabled: false,
      schedule: {},
    },
  ]);

  const [doseHistory, setDoseHistory] = useState<DoseRecord[]>([]);
  const [caregiverEnabled, setCaregiverEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const updateMedication = (id: string, updates: Partial<Medication>) => {
    setMedications(prev =>
      prev.map(med => (med.id === id ? { ...med, ...updates } : med))
    );
  };

  const addDoseRecord = (record: DoseRecord) => {
    setDoseHistory(prev => [record, ...prev]);
  };

  // Generate upcoming doses based on schedule
  useEffect(() => {
    const generateUpcomingDoses = () => {
      const doses: DoseRecord[] = [];
      const now = new Date();
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

      medications.forEach(med => {
        if (!med.enabled) return;

        Object.entries(med.schedule).forEach(([day, time]) => {
          const [hours, minutes] = time.split(':').map(Number);
          const targetDay = days.indexOf(day);
          const currentDay = now.getDay();
          
          let daysUntil = targetDay - currentDay;
          if (daysUntil < 0) daysUntil += 7;
          
          const scheduledDate = new Date(now);
          scheduledDate.setDate(now.getDate() + daysUntil);
          scheduledDate.setHours(hours, minutes, 0, 0);

          // Determine status
          let status: 'upcoming' | 'overdue' | 'dispensed' | 'missed' = 'upcoming';
          if (scheduledDate < now) {
            status = 'overdue';
          }

          doses.push({
            id: `${med.id}-${day}-${time}`,
            medicationId: med.id,
            medicationName: med.name,
            scheduledTime: scheduledDate,
            status,
          });
        });
      });

      // Sort by scheduled time
      doses.sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime());
      
      // Only keep if not already in history
      const newDoses = doses.filter(dose => 
        !doseHistory.some(h => h.id === dose.id)
      );
      
      if (newDoses.length > 0 && doseHistory.length === 0) {
        setDoseHistory(newDoses.slice(0, 10));
      }
    };

    generateUpcomingDoses();
  }, [medications]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AppContext.Provider
      value={{
        tutorialCompleted,
        setTutorialCompleted,
        tutorialActive,
        setTutorialActive,
        currentTutorialStep,
        setCurrentTutorialStep,
        connectionStatus,
        setConnectionStatus,
        demoMode,
        setDemoMode,
        medications,
        setMedications,
        updateMedication,
        doseHistory,
        addDoseRecord,
        caregiverEnabled,
        setCaregiverEnabled,
        notificationsEnabled,
        setNotificationsEnabled,
        darkMode,
        setDarkMode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
