import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, UserPlus, Mail, Phone, Shield, Trash2, Copy, Check } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { ConnectionStatusBar } from '../components/ConnectionStatusBar';
import { toast } from 'sonner';

interface Caregiver {
  id: string;
  name: string;
  email: string;
  phone: string;
  smsAlerts: boolean;
  canModifySchedule: boolean;
}

export function CaregiverManagement() {
  const navigate = useNavigate();
  const [caregivers, setCaregivers] = useState<Caregiver[]>([
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      email: 'sarah.j@healthcare.com',
      phone: '+1 (555) 123-4567',
      smsAlerts: true,
      canModifySchedule: false,
    },
  ]);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [pairingCode] = useState('MED-' + Math.random().toString(36).substr(2, 6).toUpperCase());
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(pairingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Code Copied');
  };

  const handleAdd = () => {
    if (!newName.trim() || !newEmail.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newCaregiver: Caregiver = {
      id: Date.now().toString(),
      name: newName,
      email: newEmail,
      phone: newPhone,
      smsAlerts: false,
      canModifySchedule: false,
    };

    setCaregivers([...caregivers, newCaregiver]);
    setAdding(false);
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    toast.success('Caregiver Added', {
      description: 'An invitation has been sent to their email.',
    });
  };

  const handleDelete = (id: string) => {
    const caregiver = caregivers.find(c => c.id === id);
    if (!caregiver) return;

    if (confirm(`Remove ${caregiver.name} as a caregiver?`)) {
      setCaregivers(caregivers.filter(c => c.id !== id));
      toast.success('Caregiver Removed');
    }
  };

  const handleToggleSMS = (id: string) => {
    setCaregivers(
      caregivers.map(c =>
        c.id === id ? { ...c, smsAlerts: !c.smsAlerts } : c
      )
    );
  };

  const handleTogglePermissions = (id: string) => {
    setCaregivers(
      caregivers.map(c =>
        c.id === id ? { ...c, canModifySchedule: !c.canModifySchedule } : c
      )
    );
  };

  return (
    <div className="h-full w-full flex flex-col bg-[#F8F9FA]">
      <ConnectionStatusBar />

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate('/settings')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" strokeWidth={2} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 flex-1">Caregivers</h1>
          <Button
            onClick={() => setAdding(true)}
            className="bg-[#AF52DE] hover:bg-[#AF52DE]/90 text-white rounded-xl"
          >
            <UserPlus className="w-5 h-5 mr-2" strokeWidth={2} />
            Add
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="max-w-md mx-auto px-6 py-6 space-y-6">
          {/* Pairing Code */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-[#AF52DE] to-[#9B42C8] rounded-2xl p-6 text-white"
          >
            <h3 className="text-lg font-semibold mb-2">Pairing Code</h3>
            <p className="text-white/90 text-sm mb-4">
              Share this code with caregivers to grant them access
            </p>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 flex items-center justify-between">
              <span className="font-mono text-2xl font-bold tracking-wider">
                {pairingCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="bg-white/20 hover:bg-white/30 p-3 rounded-lg transition-colors"
              >
                {copied ? (
                  <Check className="w-5 h-5" strokeWidth={2} />
                ) : (
                  <Copy className="w-5 h-5" strokeWidth={2} />
                )}
              </button>
            </div>
          </motion.div>

          {/* Caregivers List */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 px-2">
              Active Caregivers
            </h3>

            {caregivers.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                  <UserPlus className="w-12 h-12 text-gray-400" strokeWidth={2} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Caregivers Yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Add caregivers to help monitor your medication adherence
                </p>
                <Button
                  onClick={() => setAdding(true)}
                  className="bg-[#AF52DE] hover:bg-[#AF52DE]/90 text-white rounded-xl"
                >
                  <UserPlus className="w-5 h-5 mr-2" strokeWidth={2} />
                  Add Caregiver
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {caregivers.map((caregiver, index) => (
                  <motion.div
                    key={caregiver.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="bg-[#AF52DE]/10 rounded-full p-3">
                        <Shield className="w-6 h-6 text-[#AF52DE]" strokeWidth={2} />
                      </div>

                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-lg">
                          {caregiver.name}
                        </h4>
                        <div className="space-y-1 mt-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4" strokeWidth={2} />
                            {caregiver.email}
                          </div>
                          {caregiver.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="w-4 h-4" strokeWidth={2} />
                              {caregiver.phone}
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleDelete(caregiver.id)}
                        className="p-2 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <Trash2 className="w-5 h-5 text-[#FF3B30]" strokeWidth={2} />
                      </button>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">SMS Alerts</p>
                          <p className="text-sm text-gray-500">Receive text notifications</p>
                        </div>
                        <Switch
                          checked={caregiver.smsAlerts}
                          onCheckedChange={() => handleToggleSMS(caregiver.id)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">Edit Permissions</p>
                          <p className="text-sm text-gray-500">Can modify medication schedule</p>
                        </div>
                        <Switch
                          checked={caregiver.canModifySchedule}
                          onCheckedChange={() => handleTogglePermissions(caregiver.id)}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {adding && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-6 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Add Caregiver
            </h2>

            <div className="space-y-4 mb-6">
              <div>
                <Label className="mb-2 block">Full Name *</Label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Enter full name"
                  className="h-12 rounded-xl"
                  autoFocus
                />
              </div>

              <div>
                <Label className="mb-2 block">Email Address *</Label>
                <Input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="caregiver@example.com"
                  className="h-12 rounded-xl"
                />
              </div>

              <div>
                <Label className="mb-2 block">Phone Number (Optional)</Label>
                <Input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="h-12 rounded-xl"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setAdding(false);
                  setNewName('');
                  setNewEmail('');
                  setNewPhone('');
                }}
                variant="outline"
                className="flex-1 h-12 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAdd}
                disabled={!newName.trim() || !newEmail.trim()}
                className="flex-1 bg-[#AF52DE] hover:bg-[#AF52DE]/90 text-white h-12 rounded-xl disabled:opacity-50"
              >
                Add Caregiver
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
