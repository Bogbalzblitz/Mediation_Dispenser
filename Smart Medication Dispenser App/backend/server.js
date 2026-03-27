const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Allow frontend to communicate with backend
app.use(express.json()); // Parse JSON request bodies

// Dummy data structure (to be replaced with a database later)
let medications = [
  { id: 1, name: "Aspirin", schedule: "08:00", dose: "1 pill" },
  { id: 2, name: "Vitamin C", schedule: "12:00", dose: "100mg" }
];

// --- API Endpoints ---

// 1. Healthcheck to verify ESP32/Frontend can reach the server
app.get('/api/health', (req, res) => {
  res.json({ status: "ok", message: "Medication Dispenser Backend is running", timestamp: new Date() });
});

// 2. Get list of medications
app.get('/api/medications', (req, res) => {
  res.json(medications);
});

// 3. Trigger a dispense action (simulates talking to ESP32)
app.post('/api/dispense', (req, res) => {
  const { medicationId } = req.body;
  console.log(`[BACKEND] Request received to dispense medication ID: ${medicationId}`);
  
  // TODO: Add actual network request to ESP32's IP here using something like `fetch` or Axios/MQTT
  // e.g. await fetch('http://<esp32-ip-address>/trigger', { method: 'POST' });

  res.json({ success: true, message: "Dispense command sent to ESP32" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Backend Server running locally on http://localhost:${PORT}`);
  console.log('Endpoints:');
  console.log('  GET  /api/health');
  console.log('  GET  /api/medications');
  console.log('  POST /api/dispense');
});
