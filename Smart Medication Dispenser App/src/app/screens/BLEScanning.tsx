import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Bluetooth, Wifi, ArrowRight, Signal } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useApp } from '../context/AppContext';

interface BLEDevice {
  id: string;
  name: string;
  rssi: number;
}

export function BLEScanning() {
  const navigate = useNavigate();
  const { setDemoMode, setConnectionStatus } = useApp();
  const [scanning, setScanning] = useState(true);
  const [devices, setDevices] = useState<BLEDevice[]>([]);

  useEffect(() => {
    // Simulate device discovery
    const timer1 = setTimeout(() => {
      setDevices([
        { id: '1', name: 'ESP32_MedDispenser', rssi: -45 },
      ]);
    }, 1500);

    const timer2 = setTimeout(() => {
      setDevices(prev => [
        ...prev,
        { id: '2', name: 'ESP32_MedDispenser_2', rssi: -67 },
      ]);
    }, 2500);

    const timer3 = setTimeout(() => {
      setScanning(false);
    }, 3500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const handleConnect = (device: BLEDevice) => {
    setConnectionStatus({
      connected: true,
      deviceName: device.name,
      wifiConnected: false,
      mqttConnected: false,
    });
    navigate('/wifi-provision');
  };

  const handleSkip = () => {
    setDemoMode(true);
    navigate('/dashboard');
  };

  const getSignalStrength = (rssi: number) => {
    if (rssi > -50) return 3;
    if (rssi > -70) return 2;
    return 1;
  };

  return (
    <div className="h-full w-full flex flex-col bg-[#F8F9FA] p-6">
      {/* Header */}
      <div className="text-center mb-8 mt-12">
        <div className="flex justify-center mb-4">
          <div className="bg-white rounded-full p-4 shadow-md">
            <Bluetooth className="w-12 h-12 text-[#2D5BFF]" strokeWidth={2} />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Dispenser</h1>
        <p className="text-lg text-gray-600">
          Searching for nearby devices...
        </p>
      </div>

      {/* Scanning Animation */}
      {scanning && (
        <motion.div className="flex justify-center mb-8">
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0.2, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-32 h-32 rounded-full bg-[#2D5BFF]/20 flex items-center justify-center"
          >
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.7, 0.3, 0.7],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.3,
              }}
              className="w-20 h-20 rounded-full bg-[#2D5BFF]/30"
            />
          </motion.div>
        </motion.div>
      )}

      {/* Device List */}
      <div className="flex-1 overflow-auto space-y-3 mb-6">
        {devices.map((device, index) => (
          <motion.div
            key={device.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="bg-[#2D5BFF]/10 rounded-full p-2.5 flex-shrink-0">
                  <Wifi className="w-5 h-5 text-[#2D5BFF]" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-gray-900 truncate">{device.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Signal className="w-4 h-4 text-gray-400 flex-shrink-0" strokeWidth={2} />
                    <div className="flex gap-1">
                      {[1, 2, 3].map((bar) => (
                        <div
                          key={bar}
                          className={`w-1 h-3 rounded-full ${
                            bar <= getSignalStrength(device.rssi)
                              ? 'bg-[#34C759]'
                              : 'bg-gray-300'
                          }`}
                          style={{ height: `${bar * 4 + 4}px` }}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">{device.rssi} dBm</span>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => handleConnect(device)}
                className="w-full bg-[#2D5BFF] hover:bg-[#2D5BFF]/90 text-white rounded-xl min-h-[48px]"
              >
                Connect
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Skip Button */}
      <Button
        onClick={handleSkip}
        variant="ghost"
        className="w-full text-gray-600 hover:text-gray-900 flex items-center justify-center gap-2 min-h-[48px] text-lg"
      >
        Skip Setup
        <ArrowRight className="w-5 h-5" strokeWidth={2} />
      </Button>

      {!scanning && devices.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No devices found. Make sure your dispenser is powered on.</p>
        </div>
      )}
    </div>
  );
}