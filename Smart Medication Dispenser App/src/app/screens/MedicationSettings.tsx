import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, Pill, Edit2, Trash2, Plus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useApp } from '../context/AppContext';
import { ConnectionStatusBar } from '../components/ConnectionStatusBar';
import { toast } from 'sonner';

const MED_COLORS = [
  '#2D5BFF',
  '#FF9500',
  '#34C759',
  '#AF52DE',
  '#FF3B30',
  '#00C7BE',
  '#FF2D55',
  '#5856D6',
];

export function MedicationSettings() {
  const navigate = useNavigate();
  const { medications, updateMedication, setMedications } = useApp();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(MED_COLORS[0]);

  const handleEdit = (id: string) => {
    const med = medications.find(m => m.id === id);
    if (!med) return;

    setEditingId(id);
    setEditName(med.name);
    setEditColor(med.color);
  };

  const handleSaveEdit = () => {
    if (!editingId || !editName.trim()) return;

    updateMedication(editingId, {
      name: editName,
      color: editColor,
    });

    setEditingId(null);
    toast.success('Medication Updated');
  };

  const handleDelete = (id: string) => {
    const med = medications.find(m => m.id === id);
    if (!med) return;

    if (confirm(`Are you sure you want to delete "${med.name}"?`)) {
      setMedications(medications.filter(m => m.id !== id));
      toast.success('Medication Deleted');
    }
  };

  const handleAdd = () => {
    if (!newName.trim()) return;

    const newMed = {
      id: Date.now().toString(),
      name: newName,
      color: newColor,
      enabled: false,
      schedule: {},
    };

    setMedications([...medications, newMed]);
    setAdding(false);
    setNewName('');
    setNewColor(MED_COLORS[0]);
    toast.success('Medication Added');
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
          <h1 className="text-2xl font-bold text-gray-900 flex-1">Medications</h1>
          <Button
            onClick={() => setAdding(true)}
            className="bg-[#2D5BFF] hover:bg-[#2D5BFF]/90 text-white rounded-xl"
          >
            <Plus className="w-5 h-5 mr-2" strokeWidth={2} />
            Add
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="max-w-md mx-auto px-6 py-6 space-y-4">
          {medications.map((med, index) => (
            <motion.div
              key={med.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
            >
              {editingId === med.id ? (
                <div className="space-y-4">
                  <div>
                    <Label className="mb-2 block">Name</Label>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-12 rounded-xl"
                    />
                  </div>

                  <div>
                    <Label className="mb-2 block">Color</Label>
                    <div className="grid grid-cols-8 gap-2">
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

                  <div className="flex gap-3">
                    <Button
                      onClick={() => setEditingId(null)}
                      variant="outline"
                      className="flex-1 h-12 rounded-xl"
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
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${med.color}20` }}
                  >
                    <Pill className="w-6 h-6" style={{ color: med.color }} strokeWidth={2} />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">{med.name}</h3>
                    <p className="text-sm text-gray-500">
                      {Object.keys(med.schedule).length} scheduled days •{' '}
                      {med.enabled ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>

                  <button
                    onClick={() => handleEdit(med.id)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Edit2 className="w-5 h-5 text-[#2D5BFF]" strokeWidth={2} />
                  </button>

                  <button
                    onClick={() => handleDelete(med.id)}
                    className="p-2 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <Trash2 className="w-5 h-5 text-[#FF3B30]" strokeWidth={2} />
                  </button>
                </div>
              )}
            </motion.div>
          ))}

          {medications.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <Pill className="w-12 h-12 text-gray-400" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Medications
              </h3>
              <p className="text-gray-600 mb-6">Add your first medication to get started</p>
              <Button
                onClick={() => setAdding(true)}
                className="bg-[#2D5BFF] hover:bg-[#2D5BFF]/90 text-white rounded-xl"
              >
                <Plus className="w-5 h-5 mr-2" strokeWidth={2} />
                Add Medication
              </Button>
            </div>
          )}
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
              Add Medication
            </h2>

            <div className="space-y-4 mb-6">
              <div>
                <Label className="mb-2 block">Medication Name</Label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Enter medication name"
                  className="h-12 rounded-xl"
                  autoFocus
                />
              </div>

              <div>
                <Label className="mb-2 block">Color</Label>
                <div className="grid grid-cols-8 gap-2">
                  {MED_COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setNewColor(color)}
                      className={`w-full aspect-square rounded-xl transition-all ${
                        newColor === color
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
                onClick={() => {
                  setAdding(false);
                  setNewName('');
                }}
                variant="outline"
                className="flex-1 h-12 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAdd}
                disabled={!newName.trim()}
                className="flex-1 bg-[#2D5BFF] hover:bg-[#2D5BFF]/90 text-white h-12 rounded-xl disabled:opacity-50"
              >
                Add
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
