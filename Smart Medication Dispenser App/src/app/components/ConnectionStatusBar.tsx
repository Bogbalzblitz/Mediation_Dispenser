import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wifi, WifiOff, CloudOff, CheckCircle2, XCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function ConnectionStatusBar() {
  const { connectionStatus, demoMode } = useApp();
  const [expanded, setExpanded] = useState(false);

  const getStatusColor = () => {
    if (demoMode) return 'bg-[#FF9500]';
    if (connectionStatus.connected && connectionStatus.mqttConnected) return 'bg-[#34C759]';
    if (connectionStatus.connected && !connectionStatus.mqttConnected) return 'bg-[#FF9500]';
    return 'bg-[#FF3B30]';
  };

  const getStatusText = () => {
    if (demoMode) return 'Demo Mode';
    if (connectionStatus.connected && connectionStatus.mqttConnected) return 'Connected';
    if (connectionStatus.connected && !connectionStatus.mqttConnected) return 'Connecting...';
    return 'Offline';
  };

  return (
    <div data-tutorial-step="6">
      <motion.div
        initial={false}
        animate={{ height: expanded ? 'auto' : '4px' }}
        className={`${getStatusColor()} cursor-pointer`}
        onClick={() => setExpanded(!expanded)}
      />

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`${getStatusColor()} overflow-hidden`}
          >
            <div className="px-6 py-4 text-white">
              <div className="max-w-md mx-auto space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-lg">System Status</span>
                  <span className="text-sm opacity-90">{getStatusText()}</span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {connectionStatus.connected ? (
                        <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                      ) : (
                        <XCircle className="w-4 h-4" strokeWidth={2} />
                      )}
                      <span>BLE Connection</span>
                    </div>
                    <span className="opacity-90">
                      {connectionStatus.connected ? 'Active' : 'Disconnected'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {connectionStatus.wifiConnected ? (
                        <Wifi className="w-4 h-4" strokeWidth={2} />
                      ) : (
                        <WifiOff className="w-4 h-4" strokeWidth={2} />
                      )}
                      <span>Wi-Fi</span>
                    </div>
                    <span className="opacity-90">
                      {connectionStatus.wifiConnected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {connectionStatus.mqttConnected ? (
                        <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                      ) : (
                        <CloudOff className="w-4 h-4" strokeWidth={2} />
                      )}
                      <span>MQTT</span>
                    </div>
                    <span className="opacity-90">
                      {connectionStatus.mqttConnected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>

                  {connectionStatus.deviceName && (
                    <div className="flex items-center justify-between pt-2 border-t border-white/20">
                      <span>Device</span>
                      <span className="opacity-90 font-mono text-xs">
                        {connectionStatus.deviceName}
                      </span>
                    </div>
                  )}

                  {connectionStatus.lastSync && (
                    <div className="flex items-center justify-between">
                      <span>Last Sync</span>
                      <span className="opacity-90 text-xs">
                        {connectionStatus.lastSync.toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
