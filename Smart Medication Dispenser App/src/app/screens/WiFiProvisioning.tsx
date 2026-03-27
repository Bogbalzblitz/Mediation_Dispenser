import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Wifi, Lock, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Progress } from '../components/ui/progress';
import { useApp } from '../context/AppContext';

const PROVISIONING_STAGES = [
  'Sending credentials',
  'Connecting to Wi-Fi',
  'Establishing MQTT connection',
];

export function WiFiProvisioning() {
  const navigate = useNavigate();
  const { setConnectionStatus, setTutorialActive, setDemoMode } = useApp();
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [provisioning, setProvisioning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState(0);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    if (!provisioning) return;

    const stages = [
      { progress: 33, stage: 0, delay: 1000 },
      { progress: 66, stage: 1, delay: 2000 },
      { progress: 100, stage: 2, delay: 3000 },
    ];

    const timers = stages.map(({ progress: p, stage, delay }) =>
      setTimeout(() => {
        setProgress(p);
        setCurrentStage(stage);
      }, delay)
    );

    const completeTimer = setTimeout(() => {
      setComplete(true);
      setConnectionStatus({
        connected: true,
        wifiConnected: true,
        mqttConnected: true,
        lastSync: new Date(),
      });
      setDemoMode(false);
    }, 4000);

    const navigateTimer = setTimeout(() => {
      setTutorialActive(true);
      navigate('/dashboard');
    }, 5500);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(completeTimer);
      clearTimeout(navigateTimer);
    };
  }, [provisioning, navigate, setConnectionStatus, setTutorialActive, setDemoMode]);

  const handleProvision = () => {
    if (!ssid || !password) return;
    setProvisioning(true);
  };

  if (complete) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-[#F8F9FA] p-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="bg-white rounded-full p-6 shadow-lg mb-6"
        >
          <CheckCircle2 className="w-24 h-24 text-[#34C759]" strokeWidth={2} />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-gray-900 mb-2"
        >
          Connection Successful!
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg text-gray-600 text-center"
        >
          Your dispenser is ready to use
        </motion.p>
      </div>
    );
  }

  if (provisioning) {
    return (
      <div className="h-full w-full flex flex-col bg-[#F8F9FA] p-6">
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-full max-w-md">
            <div className="flex justify-center mb-6">
              <div className="bg-white rounded-full p-4 shadow-md">
                <Wifi className="w-12 h-12 text-[#2D5BFF]" strokeWidth={2} />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
              Provisioning Device
            </h1>
            <p className="text-lg text-gray-600 mb-8 text-center">
              Please wait while we set up your connection
            </p>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
              <Progress value={progress} className="mb-4 h-3" />
              <div className="text-center">
                <p className="text-2xl font-bold text-[#2D5BFF] mb-2">{progress}%</p>
                <p className="text-gray-600">{PROVISIONING_STAGES[currentStage]}</p>
              </div>
            </div>

            <div className="space-y-3">
              {PROVISIONING_STAGES.map((stage, index) => (
                <motion.div
                  key={stage}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center gap-3 p-4 rounded-xl ${
                    index < currentStage
                      ? 'bg-[#34C759]/10'
                      : index === currentStage
                      ? 'bg-[#2D5BFF]/10'
                      : 'bg-gray-50'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      index < currentStage
                        ? 'bg-[#34C759]'
                        : index === currentStage
                        ? 'bg-[#2D5BFF]'
                        : 'bg-gray-300'
                    }`}
                  >
                    {index < currentStage ? (
                      <CheckCircle2 className="w-4 h-4 text-white" strokeWidth={2} />
                    ) : (
                      <div className="w-3 h-3 bg-white rounded-full" />
                    )}
                  </div>
                  <p
                    className={`font-medium ${
                      index <= currentStage ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    {stage}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-[#F8F9FA] p-6">
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-full p-4 shadow-md">
            <Wifi className="w-12 h-12 text-[#2D5BFF]" strokeWidth={2} />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
          Connect to Wi-Fi
        </h1>
        <p className="text-lg text-gray-600 mb-8 text-center">
          Enter your network credentials
        </p>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
          <div>
            <Label htmlFor="ssid" className="text-base mb-2 block">
              Network Name (SSID)
            </Label>
            <div className="relative">
              <Wifi
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                strokeWidth={2}
              />
              <Input
                id="ssid"
                type="text"
                value={ssid}
                onChange={(e) => setSsid(e.target.value)}
                placeholder="Enter network name"
                className="pl-12 h-14 text-base rounded-xl"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="password" className="text-base mb-2 block">
              Password
            </Label>
            <div className="relative">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                strokeWidth={2}
              />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="pl-12 h-14 text-base rounded-xl"
              />
            </div>
          </div>
        </div>
      </div>

      <Button
        onClick={handleProvision}
        disabled={!ssid || !password}
        className="w-full bg-[#2D5BFF] hover:bg-[#2D5BFF]/90 text-white rounded-xl min-h-[56px] text-lg font-semibold disabled:opacity-50"
      >
        Connect Device
      </Button>
    </div>
  );
}
