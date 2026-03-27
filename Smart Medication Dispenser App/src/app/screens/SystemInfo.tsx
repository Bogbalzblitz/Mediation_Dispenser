import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Cpu,
  HardDrive,
  Wifi,
  Battery,
  Thermometer,
  Clock,
  Package,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ConnectionStatusBar } from '../components/ConnectionStatusBar';

interface SystemStat {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

export function SystemInfo() {
  const navigate = useNavigate();
  const { connectionStatus, demoMode } = useApp();

  const deviceInfo: SystemStat[] = [
    {
      label: 'Device Model',
      value: 'ESP32 MediDispenser v2',
      icon: <Cpu className="w-5 h-5" strokeWidth={2} />,
      color: '#2D5BFF',
    },
    {
      label: 'Firmware Version',
      value: '2.1.4',
      icon: <Package className="w-5 h-5" strokeWidth={2} />,
      color: '#34C759',
    },
    {
      label: 'Uptime',
      value: '7d 14h 23m',
      icon: <Clock className="w-5 h-5" strokeWidth={2} />,
      color: '#FF9500',
    },
    {
      label: 'Battery Level',
      value: '87%',
      icon: <Battery className="w-5 h-5" strokeWidth={2} />,
      color: '#34C759',
    },
  ];

  const connectivityInfo: SystemStat[] = [
    {
      label: 'Wi-Fi Status',
      value: connectionStatus.wifiConnected ? 'Connected' : 'Disconnected',
      icon: <Wifi className="w-5 h-5" strokeWidth={2} />,
      color: connectionStatus.wifiConnected ? '#34C759' : '#FF3B30',
    },
    {
      label: 'Wi-Fi SSID',
      value: connectionStatus.wifiConnected ? 'HomeNetwork_5G' : 'Not Connected',
      icon: <Wifi className="w-5 h-5" strokeWidth={2} />,
      color: '#2D5BFF',
    },
    {
      label: 'Signal Strength',
      value: connectionStatus.wifiConnected ? '-42 dBm (Excellent)' : 'N/A',
      icon: <Zap className="w-5 h-5" strokeWidth={2} />,
      color: '#34C759',
    },
    {
      label: 'MQTT Status',
      value: connectionStatus.mqttConnected ? 'Connected' : 'Disconnected',
      icon: <Wifi className="w-5 h-5" strokeWidth={2} />,
      color: connectionStatus.mqttConnected ? '#34C759' : '#FF3B30',
    },
  ];

  const storageInfo: SystemStat[] = [
    {
      label: 'Total Storage',
      value: '4 MB',
      icon: <HardDrive className="w-5 h-5" strokeWidth={2} />,
      color: '#2D5BFF',
    },
    {
      label: 'Used Storage',
      value: '1.2 MB (30%)',
      icon: <HardDrive className="w-5 h-5" strokeWidth={2} />,
      color: '#FF9500',
    },
    {
      label: 'Free Storage',
      value: '2.8 MB',
      icon: <HardDrive className="w-5 h-5" strokeWidth={2} />,
      color: '#34C759',
    },
  ];

  const sensorInfo: SystemStat[] = [
    {
      label: 'Temperature',
      value: '23.5°C',
      icon: <Thermometer className="w-5 h-5" strokeWidth={2} />,
      color: '#2D5BFF',
    },
    {
      label: 'Humidity',
      value: '45%',
      icon: <Thermometer className="w-5 h-5" strokeWidth={2} />,
      color: '#00C7BE',
    },
  ];

  const renderSection = (title: string, items: SystemStat[], delay: number) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 px-2">
        {title}
      </h3>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
        {items.map((item, index) => (
          <div key={item.label} className="p-4 flex items-center gap-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${item.color}20` }}
            >
              <div style={{ color: item.color }}>{item.icon}</div>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className="font-semibold text-gray-900 mt-1">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );

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
          <h1 className="text-2xl font-bold text-gray-900 flex-1">System Info</h1>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="max-w-md mx-auto px-6 py-6 space-y-6">
          {demoMode ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#FF9500]/10 border border-[#FF9500]/30 rounded-2xl p-6 text-center"
            >
              <p className="text-[#FF9500] font-semibold mb-2">Demo Mode Active</p>
              <p className="text-[#FF9500]/80 text-sm">
                Connect a device to view real system information
              </p>
            </motion.div>
          ) : (
            <>
              {renderSection('Device Information', deviceInfo, 0)}
              {renderSection('Connectivity', connectivityInfo, 0.1)}
              {renderSection('Storage', storageInfo, 0.2)}
              {renderSection('Sensors', sensorInfo, 0.3)}

              {/* Diagnostic Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 px-2">
                  Diagnostic Logs
                </h3>
                <div className="bg-gray-900 rounded-2xl p-4 font-mono text-sm text-gray-300 overflow-x-auto">
                  <div className="space-y-1">
                    <p>[2026-03-26 14:32:15] System boot complete</p>
                    <p>[2026-03-26 14:32:18] Wi-Fi connected: HomeNetwork_5G</p>
                    <p>[2026-03-26 14:32:21] MQTT connection established</p>
                    <p>[2026-03-26 14:32:22] Medication dispenser ready</p>
                    <p className="text-[#34C759]">[2026-03-26 15:45:10] Dose dispensed: Aspirin</p>
                    <p className="text-[#34C759]">[2026-03-26 18:12:05] Dose dispensed: Vitamin D</p>
                    <p>[2026-03-26 20:00:00] System health check: OK</p>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
