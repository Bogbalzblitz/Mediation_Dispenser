import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Pill,
  Users,
  Bell,
  Wifi,
  Moon,
  ChevronRight,
  RotateCcw,
  HelpCircle,
} from 'lucide-react';
import { Switch } from '../components/ui/switch';
import { useApp } from '../context/AppContext';
import { ConnectionStatusBar } from '../components/ConnectionStatusBar';

interface SettingItem {
  id: string;
  title: string;
  description?: string;
  icon: React.ReactNode;
  type: 'toggle' | 'nav';
  path?: string;
  value?: boolean;
  onChange?: (value: boolean) => void;
}

export function Settings() {
  const navigate = useNavigate();
  const {
    notificationsEnabled,
    setNotificationsEnabled,
    caregiverEnabled,
    setCaregiverEnabled,
    setTutorialActive,
    setCurrentTutorialStep,
    darkMode,
    setDarkMode,
  } = useApp();

  const handleReplayTutorial = () => {
    setCurrentTutorialStep(0);
    setTutorialActive(true);
    navigate('/dashboard');
  };

  const settingSections = [
    {
      title: 'Medications',
      items: [
        {
          id: 'medications',
          title: 'Manage Medications',
          description: 'Edit names, colors, and defaults',
          icon: <Pill className="w-6 h-6" strokeWidth={2} />,
          type: 'nav' as const,
          path: '/settings/medications',
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          id: 'notifications',
          title: 'Dose Reminders',
          description: 'Get notified for scheduled doses',
          icon: <Bell className="w-6 h-6" strokeWidth={2} />,
          type: 'toggle' as const,
          value: notificationsEnabled,
          onChange: setNotificationsEnabled,
        },
      ],
    },
    {
      title: 'Caregiver Access',
      items: [
        {
          id: 'caregiver-toggle',
          title: 'Enable Caregiver Access',
          description: 'Allow caregivers to monitor and manage',
          icon: <Users className="w-6 h-6" strokeWidth={2} />,
          type: 'toggle' as const,
          value: caregiverEnabled,
          onChange: setCaregiverEnabled,
        },
        ...(caregiverEnabled
          ? [
              {
                id: 'caregiver-manage',
                title: 'Manage Caregivers',
                description: 'Add or remove caregiver access',
                icon: <Users className="w-6 h-6" strokeWidth={2} />,
                type: 'nav' as const,
                path: '/settings/caregiver',
              },
            ]
          : []),
      ],
    },
    {
      title: 'Device',
      items: [
        {
          id: 'connection',
          title: 'Connection Settings',
          description: 'Manage BLE and Wi-Fi connections',
          icon: <Wifi className="w-6 h-6" strokeWidth={2} />,
          type: 'nav' as const,
          path: '/ble-scan',
        },
      ],
    },
    {
      title: 'Help',
      items: [
        {
          id: 'tutorial',
          title: 'Replay Tutorial',
          description: 'View the app walkthrough again',
          icon: <RotateCcw className="w-6 h-6" strokeWidth={2} />,
          type: 'nav' as const,
          path: '#',
        },
      ],
    },
    {
      title: 'Appearance',
      items: [
        {
          id: 'dark-mode',
          title: 'Dark Mode',
          description: 'Switch to dark mode for better visibility',
          icon: <Moon className="w-6 h-6" strokeWidth={2} />,
          type: 'toggle' as const,
          value: darkMode,
          onChange: setDarkMode,
        },
      ],
    },
  ];

  const handleItemClick = (item: SettingItem) => {
    if (item.type === 'nav') {
      if (item.id === 'tutorial') {
        handleReplayTutorial();
      } else if (item.path) {
        navigate(item.path);
      }
    }
  };

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
          <h1 className={`text-2xl font-bold flex-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Settings</h1>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="max-w-md mx-auto px-6 py-6 space-y-6">
          {settingSections.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIndex * 0.05 }}
            >
              <h3 className={`text-sm font-semibold uppercase tracking-wide mb-3 px-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {section.title}
              </h3>

              <div className={`rounded-2xl shadow-sm border divide-y ${darkMode ? 'bg-[#2A2A2A] border-gray-800 divide-gray-800' : 'bg-white border-gray-100 divide-gray-100'}`}>
                {section.items.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 flex items-center gap-4 ${
                      item.type === 'nav' ? `cursor-pointer ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}` : ''
                    }`}
                    onClick={() => item.type === 'nav' && handleItemClick(item)}
                  >
                    <div className="text-[#2D5BFF]">{item.icon}</div>

                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{item.title}</p>
                      {item.description && (
                        <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{item.description}</p>
                      )}
                    </div>

                    {item.type === 'toggle' && (
                      <Switch
                        checked={item.value}
                        onCheckedChange={item.onChange}
                      />
                    )}

                    {item.type === 'nav' && (
                      <ChevronRight className={`w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} strokeWidth={2} />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}

          {/* App Info */}
          <div className="text-center pt-6 pb-12">
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>MediCare+ v1.0.0</p>
            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              © 2026 MediCare Systems. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}