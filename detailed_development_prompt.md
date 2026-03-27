# MediCare+ Smart Medication Dispenser — Complete Backend & Dual-ESP32 Firmware Development Prompt

---

## Project Context and Overview

You are working on **MediCare+**, a smart medication dispenser system consisting of three major sub-systems: an **Android application** (already built as a Capacitor-wrapped Vite/React web app), a **Node.js backend server** (currently bare-bones with only placeholder endpoints), and **firmware for two ESP32-S3 N16R8 boards** (the primary handles intelligence, the secondary handles physical hardware). The goal of this prompt is to give you everything you need to take the backend from its current skeleton state to a fully functional production-grade server, and then build both ESP32 firmware files, sequentially and completely, with no steps skipped.

The Android app already exists at `Smart Medication Dispenser App/` in the project workspace. It is a Vite + React + TypeScript application using TailwindCSS v4, Radix UI, Framer Motion (`motion/react`), Lucide icons, MUI Material, Recharts, and Sonner for toasts. It is wrapped with Capacitor (`@capacitor/android` v8.3.0) and targets the package `com.smartdispenser.app`. The app has a complete UI with screens for: Splash, BLE Scanning, WiFi Provisioning, Dashboard, Set Schedule, Upcoming Doses, Dispenser Control, History, Settings, Medication Settings, Caregiver Management, System Info, and a Tutorial Overlay. All of these screens currently operate on **placeholder data** — hardcoded demo medications (Aspirin, Vitamin D, Blood Pressure Med), simulated BLE device discovery, fake WiFi provisioning sequences with progress bars, and an in-memory `AppContext` that generates upcoming dose records from schedule entries. The backend at `Smart Medication Dispenser App/backend/server.js` is a 48-line Express server with three endpoints: `GET /api/health`, `GET /api/medications` (returns a hardcoded array), and `POST /api/dispense` (logs to console, returns success). It has no database, no authentication, no MQTT, no push notifications, and no real device communication. The backend must be fully completed before any firmware work begins.

Three reference documents are provided for deep technical context. You must read and understand all three before writing any code:

1. **`andriod back end.txt`** — Contains the complete backend specification including all data models (User, Device, Medication, Schedule, DoseRecord, Caregiver, AuditLog, NotificationLog), JWT authentication flow, REST API endpoint definitions, MQTT topic architecture, push notification strategy (FCM + Twilio SMS), notification scheduler with cron jobs, offline-first sync protocol, tech stack recommendations, security requirements, and database index specifications. This is your backend blueprint.

2. **`architecture.pdf`** — Contains the system architecture diagram showing the relationship between the Android app, backend server, MQTT broker, and the dual ESP32 boards. It illustrates data flow: App ↔ Backend ↔ MQTT ↔ Primary ESP32 ↔ (UART) ↔ Secondary ESP32. Use this to understand the communication topology.

3. **`pin reference.txt`** — Contains the complete, verified pinout reference for both ESP32-S3 N16R8 boards. The **Main ESP32-S3** uses: GPIO 8/9 for I2C SDA/SCL to the SSD1306 OLED (address 0x3C), GPIO 6/7/10 for DS1302 RTC (CLK/DAT/RST), GPIO 5/14/11/18 for W25Q64 NOR Flash (CS/MISO/MOSI/CLK at 10 MHz), GPIO 1/2 for UART2 to SIM800L GSM module, GPIO 4/47/40/41 for NAV/SELECT/BACK/RESET buttons (active LOW with internal pull-ups), and GPIO 17/16 for UART1 TX/RX to the Peripheral ESP32-S3. Reserved GPIOs: 19/20 (USB), 35/36/37 (PSRAM), 43/44 (UART0 console), 45 (strap pin). The **Peripheral ESP32-S3** uses: GPIO 4/5/6 for I2S audio (BCLK/LRC/DIN to MAX98357A amplifier), GPIO 10/11/12/13 for SD card (CS/MOSI/CLK/MISO), GPIO 7/8/9 for stepper motor via A4988 driver (STEP/DIR/ENABLE, full-step mode, MS1-3 tied to GND), GPIO 14 for servo PWM (50 Hz), GPIO 15/18/21 for buzzer/LED/vibration motor, GPIO 38 for relay (cooling fan control), and GPIO 16/17 for UART1 RX/TX back to the Main board. Both boards share a common ground and communicate at 115200 baud 8N1.

---

## Critical Rules

1. **Sequential execution only.** Complete the backend fully and verify it works before starting any firmware development. Do not interleave backend and firmware tasks.
2. **No steps skipped.** Every model, every endpoint, every migration, every configuration file, every test — implement all of them. If the backend spec says there should be an audit log, implement the audit log. If it says there should be rate limiting, implement rate limiting.
3. **Work with the existing frontend.** The Android app already exists with specific data models (`Medication`, `DoseRecord`, `ConnectionStatus` interfaces in `AppContext.tsx`), specific route paths, and specific UI expectations. The backend API must be compatible with what the frontend expects. Study the frontend code before designing API responses.
4. **Placeholder-first development.** The app currently uses placeholder data. Build the backend so it can serve real data but also support the demo mode the frontend already has. The frontend should be able to toggle between demo mode (local data) and connected mode (API data) seamlessly.
5. **Firmware must match hardware exactly.** Use the pin assignments from `pin reference.txt` verbatim. Do not reassign pins. Do not guess pin numbers. Every GPIO reference in your firmware must match the pinout reference document exactly.
6. **UART protocol between boards, not ESP-NOW.** The two ESP32-S3 boards communicate via UART1 at 115200 baud. This is a wired connection (GPIO 17 TX → GPIO 16 RX, and GPIO 16 RX ← GPIO 17 TX, crossed). This decision is already made and reflected in the hardware wiring. Do not change it to ESP-NOW or I2C.

---

## PHASE 1: Complete Backend Development

### Step 1.1 — Project Setup and Dependencies

Replace the current bare-bones `backend/` directory with a proper Node.js backend project. Use the following stack:

- **Runtime:** Node.js (latest LTS)
- **Framework:** Express.js (or Fastify if you justify the choice, but Express is already partially set up)
- **Database:** PostgreSQL with Prisma ORM
- **Cache / Pub-Sub:** Redis (for real-time device status caching, job queues, MQTT message buffering)
- **MQTT Broker Client:** `mqtt` npm package (connecting to an external Mosquitto or EMQX broker)
- **Job Queue:** BullMQ (backed by Redis) for scheduled tasks (dose reminders, missed dose checks, device health checks)
- **Push Notifications:** `firebase-admin` SDK for FCM
- **SMS:** Twilio SDK (for caregiver SMS alerts)
- **Authentication:** `jsonwebtoken` for JWT, `bcrypt` for password hashing
- **Validation:** `zod` or `joi` for request validation
- **API Documentation:** `swagger-jsdoc` + `swagger-ui-express` for auto-generated OpenAPI docs
- **Environment Management:** `dotenv` for environment variables
- **Logging:** `winston` or `pino` for structured JSON logging
- **Testing:** `jest` + `supertest` for API integration tests

Create a proper `package.json` with all dependencies, a `.env.example` with all required environment variables (database URL, Redis URL, MQTT broker URL, JWT secret, FCM service account path, Twilio credentials, etc.), and a clear `README.md` explaining how to set up the development environment.

Set up the project directory structure following a clean layered architecture:
```
backend/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── config/                 # Configuration (env vars, constants)
│   ├── middleware/              # Auth, rate limiting, error handling, validation
│   ├── routes/                  # Express route definitions
│   ├── controllers/             # Request handlers
│   ├── services/                # Business logic layer
│   ├── models/                  # Prisma client + type extensions
│   ├── jobs/                    # BullMQ job definitions
│   ├── mqtt/                    # MQTT client, handlers, publishers
│   ├── notifications/           # FCM + Twilio integration
│   ├── utils/                   # Helpers (response formatters, error classes)
│   └── server.js                # Express app initialization
├── tests/                       # Jest test suites
├── .env.example
├── package.json
└── README.md
```

### Step 1.2 — Database Schema (Prisma)

Define the complete Prisma schema with all entities specified in `andriod back end.txt`. The models are:

**User:** `id` (UUID, default cuid), `email` (unique), `phone` (optional), `displayName`, `passwordHash`, `role` (enum: PATIENT, CAREGIVER), `fcmToken` (optional), `preferences` (JSON with `notificationsEnabled`, `darkMode`, `tutorialCompleted`), `createdAt`, `updatedAt`. One user can own many devices and many medications.

**Device:** `id` (UUID), `ownerId` (FK → User), `deviceName` (string, e.g. "ESP32_MedDispenser"), `macAddress` (unique), `wifiSsid` (optional, stored after provisioning — note: Wi-Fi password is NEVER stored server-side), `mqttClientId` (unique), `firmwareVersion`, `hardwareVersion`, `batteryLevel` (Int, 0-100), `status` (enum: ONLINE, OFFLINE, ERROR, DISPENSING), `lastHeartbeat` (DateTime), `createdAt`, `updatedAt`. Has many Medications.

**Medication:** `id` (UUID), `deviceId` (FK → Device), `userId` (FK → User), `name` (string, max 100 chars), `color` (hex string like "#2D5BFF"), `enabled` (boolean), `slotNumber` (Int, physical slot 1-6), `dosageAmount` (optional string), `dosageUnit` (optional string, e.g. "mg"), `notes` (optional text), `createdAt`, `updatedAt`. Has many Schedules and DoseRecords.

**Schedule:** `id` (UUID), `medicationId` (FK → Medication), `dayOfWeek` (enum: MONDAY through SUNDAY), `time` (String in "HH:MM" format), `enabled` (boolean). Unique constraint on `(medicationId, dayOfWeek, time)`.

**DoseRecord:** `id` (UUID), `medicationId` (FK → Medication), `scheduleId` (FK → Schedule, optional for manual dispenses), `scheduledTime` (DateTime), `dispensedTime` (DateTime, optional), `status` (enum: UPCOMING, DISPENSED, MISSED, OVERDUE, SNOOZED), `snoozeUntil` (DateTime, optional), `dispensedBy` (enum: AUTOMATIC, MANUAL, CAREGIVER, REMOTE, optional), `confirmedByUser` (boolean), `createdAt`.

**Caregiver:** `id` (UUID), `patientId` (FK → User, the device owner), `caregiverId` (FK → User, the caregiver), `pairingCode` (string, format "MED-XXXXXX", expires after use), `pairingCodeExpiresAt` (DateTime), `smsAlertsEnabled` (boolean), `canModifySchedule` (boolean), `canDispenseRemotely` (boolean), `status` (enum: PENDING, ACTIVE, REVOKED), `createdAt`, `updatedAt`.

**AuditLog:** `id` (UUID), `userId` (FK → User), `deviceId` (FK → Device, optional), `action` (string enum of specific actions like "SCHEDULE_CREATED", "DOSE_DISPENSED", "DOSE_MISSED", "CAREGIVER_ADDED", "CAREGIVER_REMOVED", "DEVICE_PAIRED", "DEVICE_OFFLINE", "SETTINGS_CHANGED", "REMOTE_DISPENSE"), `metadata` (JSON), `ipAddress` (string), `createdAt`.

**NotificationLog:** `id` (UUID), `userId` (FK → User), `type` (enum: DOSE_REMINDER, DOSE_MISSED, DEVICE_OFFLINE, CAREGIVER_ALERT, LOW_BATTERY, REFILL_NEEDED), `title` (string), `body` (string), `sentAt` (DateTime), `readAt` (DateTime, optional), `deliveryStatus` (enum: SENT, DELIVERED, FAILED).

Add proper database indexes as specified in `andriod back end.txt`:
- `DoseRecord`: composite index on `(medicationId, scheduledTime)`, index on `(status, scheduledTime)`
- `Device`: index on `lastHeartbeat`, unique on `macAddress`
- `Schedule`: composite unique on `(medicationId, dayOfWeek, time)`
- `Caregiver`: index on `pairingCode` where status = PENDING
- `AuditLog`: index on `(userId, createdAt)`, index on `(deviceId, createdAt)`

Run the Prisma migration to create all tables.

### Step 1.3 — Authentication & Authorization Middleware

Implement JWT-based authentication:

- Access tokens with 15-minute expiry
- Refresh tokens with 30-day expiry, rotated on each use
- Store refresh tokens in a separate `RefreshToken` table or Redis for revocation support
- `bcrypt` for password hashing with salt rounds of 12

Auth endpoints:
- `POST /auth/register` — Create account with email, password, displayName, optional phone. Validate email uniqueness. Return access + refresh tokens.
- `POST /auth/login` — Validate credentials, return access + refresh tokens.
- `POST /auth/refresh` — Accept refresh token, validate it, rotate (invalidate old, issue new), return new access + refresh tokens.
- `POST /auth/forgot-password` — Generate 6-digit OTP, send via email (for now, log to console if no email service is configured), store OTP hash with 15-min expiry.
- `POST /auth/reset-password` — Verify OTP, set new password.
- `DELETE /auth/account` — Soft delete with 30-day recovery window (add `deletedAt` field to User).

Authorization middleware must:
- Validate JWT on every protected endpoint
- Extract user ID from token and attach to request
- Check resource ownership (e.g., a patient can only access their own devices, medications)
- Check caregiver permissions (a caregiver can only access a patient's data if an ACTIVE caregiver relationship exists and the specific permission is granted)
- Rate limit auth endpoints: 10 requests/minute per IP
- Rate limit general endpoints: 100 requests/minute per user

### Step 1.4 — REST API Endpoints

Implement every endpoint specified in `andriod back end.txt`, grouped by resource:

**Devices:**
- `POST /devices` — Register a new device after BLE pairing (accepts `macAddress`, `deviceName`). Generate unique `mqttClientId`. Return device object.
- `GET /devices` — List current user's devices. Include current status and battery level.
- `GET /devices/:id` — Detailed device info including status, last heartbeat, firmware version.
- `PUT /devices/:id/wifi` — Store Wi-Fi SSID after provisioning. NEVER accept or store the Wi-Fi password (that is sent directly to ESP32 via BLE on the client side).
- `DELETE /devices/:id` — Unpair device. Revoke MQTT credentials. Mark as deleted.

**Medications:**
- `GET /devices/:deviceId/medications` — List all medications for a device.
- `POST /devices/:deviceId/medications` — Create new medication with name, color, slotNumber, dosageAmount, dosageUnit, notes.
- `PUT /devices/:deviceId/medications/:id` — Update medication details.
- `DELETE /devices/:deviceId/medications/:id` — Delete medication and cascade delete schedules and upcoming dose records.
- `PUT /devices/:deviceId/medications/:id/toggle` — Toggle enabled/disabled.

**Schedules:**
- `GET /medications/:medId/schedules` — List all schedules for a medication.
- `POST /medications/:medId/schedules/bulk` — Create/update multiple day-time pairs at once. Accept an array of `{ dayOfWeek, time }` objects. This matches the frontend's "Quick Schedule" multi-day selection feature in `SetSchedule.tsx` where users select multiple days and apply a single time.
- `PUT /schedules/:id` — Update a single schedule entry.
- `DELETE /schedules/:id` — Remove a schedule entry.

**Doses:**
- `GET /doses?status=upcoming&limit=20` — Upcoming doses with pagination. Must match the `DoseRecord` interface the frontend expects: `{ id, medicationId, medicationName, scheduledTime, dispensedTime?, status }`.
- `GET /doses/history?from=DATE&to=DATE&status=FILTER&page=1&limit=50` — Historical doses with filtering and pagination. This feeds the History screen which shows adherence rate and filterable dose list.
- `POST /doses/:id/dispense` — Manually mark a dose as dispensed from the app. Set `dispensedTime` to now, `dispensedBy` to MANUAL. This matches the "Dispense Now" button in `Dispenser.tsx`.
- `POST /doses/:id/snooze` — Snooze a dose for N minutes `{ minutes: 5|10|15 }`. Set `status` to SNOOZED, set `snoozeUntil`. This matches the snooze buttons (5m, 10m, 15m) in `Dispenser.tsx`.
- `GET /doses/stats?period=7d|30d|90d` — Adherence statistics: dispensed/total ratio, current streak, per-medication breakdown. This feeds the adherence rate circle chart in `History.tsx`.
- `GET /doses/export?format=csv&from=DATE&to=DATE` — Export dose history as CSV download. This matches the export button in `History.tsx`.

**Caregivers:**
- `POST /caregivers/generate-code` — Generate a 6-character alphanumeric pairing code (format: "MED-XXXXXX") with 24-hour expiry. This matches the pairing code display in `CaregiverManagement.tsx`.
- `POST /caregivers/pair` — Caregiver submits a pairing code to link accounts. Validate code exists, not expired, not already used.
- `GET /caregivers` — For patients: list their caregivers. For caregivers: list their patients. This feeds the caregiver list in `CaregiverManagement.tsx`.
- `PUT /caregivers/:id` — Update permissions (`smsAlertsEnabled`, `canModifySchedule`, `canDispenseRemotely`). These match the toggles for "SMS Alerts" and "Edit Permissions" in `CaregiverManagement.tsx`.
- `DELETE /caregivers/:id` — Revoke access. Immediately invalidate caregiver's ability to see patient data.
- `GET /caregivers/:patientId/dashboard` — Caregiver view of a patient's upcoming doses, adherence stats, device status.

**Dispenser Control:**
- `POST /devices/:id/dispense` — Trigger remote dispense via MQTT command. Publish to `dispenser/{device_id}/cmd/dispense`.
- `POST /devices/:id/pause` — Pause automatic dispensing. Publish to `dispenser/{device_id}/cmd/pause`.
- `POST /devices/:id/resume` — Resume automatic dispensing. This matches the "Pause Schedule" / "Resume Schedule" toggle in `Dispenser.tsx`.

**System / Utility:**
- `GET /health` — Health check endpoint returning `{ status: "ok", timestamp, database: "connected", redis: "connected", mqtt: "connected" }`.
- `POST /sync` — Offline sync endpoint. Accept batch of local changes with timestamps, return server state delta since last sync. Use last-write-wins conflict resolution with server timestamps for schedule changes; append-only for dose records.

### Step 1.5 — MQTT Broker Integration

The ESP32 communicates with the server via MQTT. The backend must be both a publisher and subscriber.

**MQTT Topics (implement all of these):**

| Topic | Direction | Payload | Purpose |
|---|---|---|---|
| `dispenser/{device_id}/status` | ESP32 → Server | `{ status, battery, slot_states, timestamp }` | Heartbeat every 30s |
| `dispenser/{device_id}/dose/dispensed` | ESP32 → Server | `{ slot, medication_id, timestamp }` | Confirm physical dispense |
| `dispenser/{device_id}/dose/failed` | ESP32 → Server | `{ slot, error_code, timestamp }` | Dispense failure (jam, empty slot) |
| `dispenser/{device_id}/cmd/dispense` | Server → ESP32 | `{ slot, medication_id, request_id }` | Trigger dispense |
| `dispenser/{device_id}/cmd/pause` | Server → ESP32 | `{ paused: bool }` | Pause/resume |
| `dispenser/{device_id}/cmd/schedule_sync` | Server → ESP32 | `{ schedules: [...] }` | Push updated schedules on change |
| `dispenser/{device_id}/alert` | ESP32 → Server | `{ type, message, severity }` | Low battery, slot empty, hardware error |

**Backend MQTT responsibilities:**
- Subscribe to `dispenser/+/status`, `dispenser/+/dose/#`, `dispenser/+/alert` wildcard topics
- On `dose/dispensed`: update the corresponding `DoseRecord` status to DISPENSED, set `dispensedTime`, send push notification to patient and all active caregivers
- On `dose/failed`: create an alert `NotificationLog`, send immediate push to patient + caregivers, log the failure in `AuditLog`
- On `status` heartbeat: update `Device.lastHeartbeat`, `Device.batteryLevel`, `Device.status` (cache in Redis for fast reads from the dashboard)
- On `alert`: create `NotificationLog`, send FCM push, if type is `low_battery` or `slot_empty` then also send caregiver SMS if `smsAlertsEnabled` is true for the caregiver
- If no heartbeat received for 2+ minutes: mark device OFFLINE, send `device_offline` notification
- When any schedule is modified via API: publish `cmd/schedule_sync` to the device with the complete updated schedule array
- Use QoS 1 (at-least-once delivery) for dose events and alerts; QoS 0 for status heartbeats
- Authenticate devices using unique credentials generated during pairing, stored in the Device record

### Step 1.6 — Push Notifications & Alerting

Implement Firebase Cloud Messaging (FCM) integration:

- `dose_reminder`: Send 5 minutes before scheduled time.
- `dose_missed`: Send 15 minutes after scheduled time if dose status is still UPCOMING.
- `device_offline`: Send after 2+ minutes of no heartbeat.
- `low_battery`: Send when battery drops below 20%.
- `refill_needed`: Send when ESP32 reports a slot is empty.
- `caregiver_alert`: Forward missed/failed dose alerts to all active caregivers with `smsAlertsEnabled`.

For SMS alerts via Twilio:
- Only for critical events: missed dose (after 15-min grace), device offline (after 5 min), dispense failure
- Rate limit: max 10 SMS per caregiver per day
- Store SMS delivery status in `NotificationLog`

### Step 1.7 — Background Jobs (BullMQ)

Implement these scheduled jobs:

| Job | Frequency | Description |
|---|---|---|
| `generate-upcoming-doses` | Every minute | Create `DoseRecord` entries for doses due in the next 24 hours |
| `check-missed-doses` | Every minute | Mark overdue doses (>15 min past scheduled) as MISSED, send alerts |
| `send-reminders` | Every minute | Send FCM push for doses due in 5 minutes |
| `check-device-health` | Every 30 seconds | Mark devices OFFLINE if no heartbeat for 2+ minutes |
| `expire-pairing-codes` | Every hour | Invalidate expired caregiver pairing codes |
| `cleanup-audit-logs` | Daily at 3 AM | Archive audit logs older than 1 year |
| `adherence-report` | Daily at 9 AM | Generate daily adherence summary, send to caregivers |

Each job must be idempotent (safe to retry). Use BullMQ's built-in retry mechanism with exponential backoff for failed jobs.

### Step 1.8 — Security Implementation

- All API communication must enforce HTTPS (include TLS configuration notes)
- MQTT connections must use TLS (port 8883)
- Wi-Fi passwords are NEVER stored server-side (sent directly to ESP32 via BLE)
- Rate limiting: 100 req/min general, 10 req/min auth
- Input validation on all endpoints (names max 100 chars, times must be valid HH:MM, UUIDs must be valid format, etc.)
- HIPAA-awareness: encrypt PII at rest (AES-256 via Prisma's encryption extension or manual column encryption), use parameterized queries (Prisma handles this), implement complete audit logging for all data access and modifications
- Device authentication: each ESP32 gets unique MQTT credentials during pairing, revocable on unpair
- Caregiver access is fully revocable — revoking immediately invalidates all access

### Step 1.9 — API Documentation

Set up Swagger/OpenAPI auto-generated documentation at `/api-docs`. Every endpoint must be documented with request/response schemas, authentication requirements, and example payloads.

### Step 1.10 — Testing and Verification

Write integration tests for:
- Authentication flow (register → login → refresh → protected endpoint)
- CRUD operations for all resources
- Authorization checks (user A cannot access user B's data, caregiver permissions are enforced)
- Dose scheduling logic (upcoming doses are generated correctly given a schedule)
- MQTT message handling (simulate heartbeat → device status updated, simulate dose/dispensed → DoseRecord updated)

Run all tests and verify they pass. Verify the server starts correctly with `npm run dev`. Verify the health endpoint returns all subsystem statuses.

**Do not proceed to Phase 2 until the backend is fully complete, all endpoints are implemented, all jobs are scheduled, and tests pass.**

---

## PHASE 2: Primary ESP32-S3 Firmware

The primary ESP32-S3 is the brain of the dispenser. It handles all connectivity, scheduling logic, user interface (OLED display + 4 buttons), and communication with both the backend (via WiFi/MQTT) and the secondary ESP32-S3 (via UART).

### Step 2.1 — Project Structure and Configuration

Create the primary firmware as an Arduino or PlatformIO project. Define a `config.h` header file with ALL pin definitions matching `pin reference.txt` exactly:

```cpp
// I2C Bus — SSD1306 OLED
#define PIN_SDA       8
#define PIN_SCL       9
#define OLED_ADDR     0x3C

// RTC DS1302 — 3-Wire Interface
#define PIN_RTC_CLK   6
#define PIN_RTC_DAT   7
#define PIN_RTC_RST   10

// W25Q64 NOR Flash — SPI
#define PIN_FLASH_CS    5
#define PIN_FLASH_MISO  14
#define PIN_FLASH_MOSI  11
#define PIN_FLASH_CLK   18

// GSM Module SIM800L — UART2
#define PIN_GSM_TX    1
#define PIN_GSM_RX    2

// Navigation Buttons — Active LOW, internal pull-ups
#define PIN_BTN_NAV     4
#define PIN_BTN_SELECT  47
#define PIN_BTN_BACK    40
#define PIN_BTN_RESET   41

// UART1 to Peripheral ESP32-S3
#define PIN_AUDIO_TX  17
#define PIN_AUDIO_RX  16
#define UART_BAUD     115200
```

Include all required libraries: WiFi, PubSubClient (MQTT), ArduinoJson, Adafruit SSD1306, DS1302 RTC, Preferences, and any SPI flash library for the W25Q64.

### Step 2.2 — BLE Setup & WiFi Provisioning Flow

On first boot or after a factory reset, the main ESP32-S3 must:

1. Enter BLE advertising mode with a device name like "ESP32_MedDispenser" (matching the name the Android app's `BLEScanning.tsx` screen searches for).
2. Expose a BLE GATT service with characteristics for:
   - **WiFi SSID** (write characteristic) — App writes the network SSID
   - **WiFi Password** (write characteristic) — App writes the network password
   - **Provisioning Status** (read/notify characteristic) — ESP32 sends status updates: "connecting", "connected", "mqtt_connected", "ready", or "failed"
3. Upon receiving credentials via BLE, attempt WiFi connection with a 15-second timeout.
4. Once WiFi is connected, initialize the MQTT client and connect to the broker.
5. Once MQTT is connected, sync time from NTP and set the DS1302 RTC.
6. Send a "ready" status via BLE notify, then stop BLE advertising (to save power and avoid interference).
7. Display the connection status on the OLED during this process.

The provisioning stages must match what `WiFiProvisioning.tsx` expects: "Sending credentials" → "Connecting to Wi-Fi" → "Establishing MQTT connection". The success screen expects a clear "Connection Successful" state.

Persist the WiFi SSID, MQTT client ID, and provisioning completion flag in `Preferences` (NVS) so the device reconnects automatically on subsequent boots without re-pairing.

**Make sure everything is set up before presenting the main menu.** The main menu should only appear after WiFi, MQTT, and RTC are all confirmed operational.

### Step 2.3 — OLED Display & Menu System

Implement a full menu system on the SSD1306 OLED (128×64 pixels) driven by the four navigation buttons:

- **NAV button (GPIO 4):** Scroll through menu items or options within a submenu
- **SELECT button (GPIO 47):** Confirm selection, enter submenu, or confirm dispense during alarm
- **BACK button (GPIO 40):** Go back to previous menu, or cancel during alarm
- **RESET button (GPIO 41):** 5-second long press triggers factory reset (clear Preferences, restart)

**Main Menu Items:**

1. **Upcoming** — Shows the next 3 upcoming medication events. Each entry should display: medication name, scheduled day, scheduled time. Data comes from the locally stored schedule (synced from the backend via MQTT `cmd/schedule_sync`).

2. **History** — Shows the last 3 taken (dispensed) medication events. Each entry displays: medication name, time taken. Data is stored in the W25Q64 flash or in Preferences.

3. **Settings** — Opens a submenu:
   - **Ringtone Selection:** Query the secondary ESP32-S3 via UART to get a list of ringtone filenames from the SD card. Display the list on the OLED and let the user scroll through them with NAV and select one with SELECT. The selected ringtone filename is stored in Preferences and sent in the alarm command to the secondary board. When a ringtone is selected, it should play briefly as a preview (send a "PREVIEW" command to the secondary board). The default ringtone should be the first one listed if none is selected.

4. **System Info** — Displays:
   - Stepper motor total stops: 21
   - Current stop position (read from secondary ESP32-S3 via UART)
   - WiFi signal strength (RSSI)
   - MQTT connection status
   - Firmware version
   - RTC date/time
   - Free heap memory

All menu transitions should use non-blocking rendering. Do not use `delay()` in the main loop.

### Step 2.4 — Medication Scheduling and Stop Mapping

The medication carousel has **21 stops**, mapped sequentially across 7 days with 3 medication slots per day:

- Wednesday: Stop 1, Stop 2, Stop 3
- Thursday: Stop 4, Stop 5, Stop 6
- Friday: Stop 7, Stop 8, Stop 9
- Saturday: Stop 10, Stop 11, Stop 12
- Sunday: Stop 13, Stop 14, Stop 15
- Monday: Stop 16, Stop 17, Stop 18
- Tuesday: Stop 19, Stop 20, Stop 21

(The starting day can be configurable, but this is the default mapping.)

The schedule is received from the backend via MQTT on the `cmd/schedule_sync` topic. The main ESP32 must:
- Parse the schedule JSON payload
- Store the schedule in NVS / Preferences so it survives reboots
- Resolve which stop number corresponds to the current medication event based on day-of-week and medication index for that day
- Include the resolved stop number in the MOVE command sent to the secondary board

### Step 2.5 — Medication Time Notification Flow

When a scheduled medication time is reached:

1. **1-2 minutes before the scheduled time:** Send a pre-positioning MOVE command to the secondary ESP32-S3 via UART: `{"cmd":"MOVE","stop":<N>}`. This rotates the carousel early so the correct compartment is ready when the alarm fires.

2. **Wait for acknowledgment** from the secondary board: `{"status":"DONE","stop":<N>}`. Implement a timeout of 5 seconds with up to 3 retries. If all retries fail, flag a motor error but continue to alert the user.

3. **At the exact scheduled time:** Display a medication notification popup on the OLED:
   - Medication name
   - Scheduled time
   - Three options: **Confirm** (SELECT button), **Cancel** (BACK button), **Snooze** (NAV button, cycles through 5/10/15 min snooze options)

4. **Simultaneously:** Send a notification to the Android app via MQTT → Backend → FCM push notification. The app should display the same notification popup with the same options (Confirm, Cancel, Snooze).

5. **Play the alarm:** Send the alarm command to the secondary ESP32-S3 via UART: `{"cmd":"ALARM","ringtone":"<filename>"}`. The secondary board will play the selected ringtone from the SD card through the I2S amplifier, activate the buzzer, flash the LED, and run the vibration motor.

6. **On Confirm (from either ESP32 button or app):** Send a dispense confirmation to the backend via MQTT (`dose/dispensed`). Stop the alarm by sending `{"cmd":"STOP_ALARM"}` to the secondary board. Update local history.

7. **On Cancel:** Stop the alarm. Mark the dose as missed locally and via MQTT.

8. **On Snooze:** Stop the alarm. Set a snooze timer for the selected duration. Re-trigger the full alarm sequence when the snooze expires.

### Step 2.6 — MQTT Communication

The main ESP32-S3 must implement the full MQTT client:

**Publishing:**
- `dispenser/{device_id}/status` every 30 seconds with: `{ "status": "online|dispensing|error", "battery": <level>, "slot_states": [...], "timestamp": <ISO> }` — Note: battery level may not apply if powered by USB; send 100 or omit.
- `dispenser/{device_id}/dose/dispensed` when a dose is confirmed
- `dispenser/{device_id}/dose/failed` when a dispense fails mechanically
- `dispenser/{device_id}/alert` for low battery, slot empty, hardware errors

**Subscribing:**
- `dispenser/{device_id}/cmd/dispense` — Remote dispense command from the app/backend
- `dispenser/{device_id}/cmd/pause` — Pause/resume automatic dispensing
- `dispenser/{device_id}/cmd/schedule_sync` — Updated schedule from the backend

Use QoS 1 for dose events and alerts. QoS 0 for heartbeats. Implement auto-reconnect with exponential backoff if MQTT connection drops. Buffer unsent messages during disconnection and publish them when connection is restored (especially critical dose events).

### Step 2.7 — UART Communication Protocol with Secondary Board

Define a clear, robust UART protocol. All messages are JSON strings terminated with a newline `\n`. The main board sends commands and waits for responses:

**Commands (Main → Secondary):**
- `{"cmd":"MOVE","stop":<1-21>}` — Move stepper to target stop
- `{"cmd":"ALARM","ringtone":"<filename>"}` — Start playing alarm with specified ringtone from SD card, activate buzzer, LED, vibration
- `{"cmd":"STOP_ALARM"}` — Stop all alarm outputs
- `{"cmd":"PREVIEW","ringtone":"<filename>"}` — Briefly play a ringtone for settings preview
- `{"cmd":"LIST_RINGTONES"}` — Request list of ringtone files from SD card
- `{"cmd":"GET_POSITION"}` — Request current stepper position
- `{"cmd":"PING"}` — Health check

**Responses (Secondary → Main):**
- `{"status":"DONE","stop":<N>}` — Move completed successfully
- `{"status":"ALARM_STARTED"}` — Alarm is playing
- `{"status":"ALARM_STOPPED"}` — Alarm stopped
- `{"status":"RINGTONES","files":["tone1.wav","tone2.wav",...]}` — List of available ringtones
- `{"status":"POSITION","stop":<N>,"steps":<total_steps>}` — Current position
- `{"status":"PONG"}` — Health check response
- `{"status":"ERROR","message":"<description>"}` — Error response

### Step 2.8 — Long Press Reset

Monitor the RESET button (GPIO 41). If held for 5 continuous seconds:
1. Display a "FACTORY RESET?" confirmation on the OLED
2. If SELECT is pressed to confirm: clear all Preferences/NVS data, display "Resetting...", and reboot the ESP32
3. If BACK is pressed or timeout: cancel and return to the menu

### Step 2.9 — Non-Blocking Architecture

The entire main loop must be non-blocking. Use `millis()` timers or FreeRTOS tasks for:
- Button debouncing and long-press detection
- OLED display refresh
- MQTT heartbeat publishing
- Schedule checking (compare current RTC time against schedule entries every second)
- UART communication with secondary board
- Alarm timeout management
- Snooze timer management

**No use of `delay()` in the main loop whatsoever.** All timing must be event-driven or `millis()`-based.

---

## PHASE 3: Secondary ESP32-S3 Firmware

The secondary ESP32-S3 handles all physical hardware: stepper motor, servo motor, audio playback, buzzer, LED, vibration motor, relay, and SD card. It has **no WiFi connection**. It receives all commands from the main board via UART and responds with acknowledgments.

### Step 3.1 — Project Structure and Configuration

Create a separate firmware project for the secondary board. Define `config.h` with all pin definitions matching `pin reference.txt`:

```cpp
// I2S Audio — MAX98357A Amplifier
#define PIN_I2S_BCLK  4
#define PIN_I2S_LRC   5
#define PIN_I2S_DOUT  6

// SD Card — SPI
#define PIN_SD_CS     10
#define PIN_SD_MOSI   11
#define PIN_SD_CLK    12
#define PIN_SD_MISO   13

// Stepper Motor — A4988 Driver (NEMA 17 + 50:1 Gearbox)
#define PIN_STEP_STEP   7
#define PIN_STEP_DIR    8
#define PIN_STEP_EN     9

// Servo Motor — Dispensing Hatch
#define PIN_SERVO       14

// Alert Outputs
#define PIN_BUZZER      15
#define PIN_LED         18
#define PIN_VIB         21

// Relay — Cooling Fan
#define PIN_RELAY       38

// UART1 to Main ESP32-S3
#define PIN_UART_RX     16
#define PIN_UART_TX     17
#define UART_BAUD       115200
```

Include libraries: ArduinoJson, SD, ESP32Servo, Preferences, and the ESP32 I2S driver for audio playback via MAX98357A.

### Step 3.2 — Stepper Motor Control with Bresenham Positioning

The stepper motor has **200 steps/revolution** with a **50:1 gear ratio** = **10,000 steps per full output revolution**. The carousel has **21 stops**, so each stop is exactly `10000 / 21 ≈ 476.19` steps — **not a whole number**. A naive fixed-step approach would accumulate rounding error and cause the carousel to drift out of alignment over time.

**You MUST implement the Bresenham running-error positioning algorithm:**

For any target stop `N` (1-21), the absolute target position in steps is:
```
target_steps = round(N * (10000.0 / 21.0))
```

The number of steps to move is:
```
steps_to_move = target_steps - current_step_position
```

This naturally alternates between 476 and 477 steps per move, self-correcting any rounding error. After completing all 21 stops the output shaft has made exactly 10,000 steps — a perfect full revolution with zero accumulated drift.

**Position persistence:** The `current_step_position` must be stored in `Preferences` (NVS) after every move. On boot, the position is loaded from Preferences. If no position exists (first boot), default to 0 (home position).

**Motor driving details:**
- Enable the motor driver by pulling `PIN_STEP_EN` LOW before stepping
- Set direction via `PIN_STEP_DIR` (HIGH or LOW depending on shortest path — calculate both CW and CCW distances and take the shorter one for efficiency)
- Pulse `PIN_STEP_STEP` with appropriate timing — start at a low speed and accelerate/decelerate smoothly using a trapezoidal acceleration profile for quiet and reliable operation
- Disable the motor driver after the move is complete to reduce power consumption and heat
- Full-step mode (MS1/MS2/MS3 all tied to GND, as per the wiring)

### Step 3.3 — Servo Motor Control

After the stepper motor completes its move to the target stop:

1. Attach the servo on `PIN_SERVO` (50 Hz PWM)
2. Sweep from 0° to 180° (open the dispensing hatch) — use a gradual sweep, not an instantaneous jump, for mechanical gentleness
3. Hold at 180° for a configurable dwell time (define `SERVO_DWELL_MS` as a constant at the top of the file, default 1500ms) to allow medication to fall through
4. Sweep back from 180° to 0° (close the hatch)
5. Detach the servo (to prevent jitter and save power)
6. Only after the servo is fully closed: send the `{"status":"DONE","stop":<N>}` acknowledgment back to the main board via UART

The servo timing should use non-blocking patterns (millis-based state machine) rather than blocking delays.

### Step 3.4 — Audio Playback System

The secondary ESP32-S3 plays ringtone audio through the **MAX98357A I2S amplifier** connected on GPIO 4/5/6, with audio files stored on the **SD card** connected via SPI on GPIO 10/11/12/13.

**SD Card Management:**
- Initialize the SD card on boot. If initialization fails, log the error and continue (the system can still buzz/vibrate for alarms without audio)
- Read `.wav` files from the root directory of the SD card
- Handle the `LIST_RINGTONES` command by scanning the root directory for `.wav` files and returning the list as JSON via UART

**Audio Playback:**
- Configure I2S output with 16-bit samples, 44100 Hz sample rate (or auto-detect from WAV header), mono or stereo as specified by the WAV file
- Read WAV file data from SD card and stream it to the I2S peripheral
- Implement the ALARM command: play the specified ringtone file in a loop until a STOP_ALARM command is received
- Implement the PREVIEW command: play the specified ringtone once (single play, not looped) for settings preview
- During alarm playback, simultaneously activate the buzzer (GPIO 15), flash the LED (GPIO 18) with a visible pattern (e.g., 500ms on / 500ms off), and pulse the vibration motor (GPIO 21) with a distinct pattern (e.g., 200ms on / 300ms off)
- On STOP_ALARM: stop audio playback, turn off buzzer, LED, and vibration motor immediately

### Step 3.5 — Relay Control (Cooling Fan)

The relay on GPIO 38 controls a 12V DC cooling fan. Implement:
- Turn on the relay (fan) when the stepper motor is running (the motor and A4988 driver generate heat during movement)
- Turn off the relay after a configurable cooldown period after the motor stops (e.g., 30 seconds after last motor movement)
- Optionally expose a `FAN_ON` / `FAN_OFF` command via UART for manual control

### Step 3.6 — UART Command Processing

Implement a robust UART command processor:

1. Listen continuously on UART1 (GPIO 16 RX, GPIO 17 TX) at 115200 baud
2. Buffer incoming bytes until a newline `\n` is received
3. Parse the JSON command using ArduinoJson
4. Execute the appropriate action based on the `cmd` field
5. Send the JSON response terminated with `\n`

Handle all commands defined in Step 2.7:
- `MOVE` → Execute stepper positioning + servo cycle, respond with DONE
- `ALARM` → Start alarm playback + buzzer + LED + vibration, respond with ALARM_STARTED
- `STOP_ALARM` → Stop all alarm outputs, respond with ALARM_STOPPED
- `PREVIEW` → Play ringtone once, respond with DONE when playback finishes
- `LIST_RINGTONES` → Scan SD card root directory, respond with RINGTONES list
- `GET_POSITION` → Respond with current stop position and step count
- `PING` → Respond with PONG

All UART responses must be sent within a reasonable time. If a command like MOVE takes time (stepper movement + servo cycle), the acknowledgment is sent only after everything is complete.

### Step 3.7 — Full Operational Sequence (End-to-End)

When the secondary ESP32-S3 receives a `MOVE` command:

1. Parse the target stop number from the JSON payload
2. Turn on the cooling fan relay (if implementing fan control during motor operation)
3. Calculate the precise step count using the Bresenham method (`target = round(stop * 10000.0 / 21.0)`, `delta = target - current_position`)
4. Determine the optimal direction (CW vs CCW — take the shorter path)
5. Enable the stepper driver (`PIN_STEP_EN` LOW)
6. Accelerate, run, decelerate the stepper to the target position using a trapezoidal profile
7. Confirm the stepper has reached the target position
8. Persist the new `current_step_position` to Preferences
9. Disable the stepper driver (`PIN_STEP_EN` HIGH)
10. Execute the servo open-dwell-close cycle:
    - Sweep to 180° (open)
    - Hold for `SERVO_DWELL_MS` milliseconds
    - Sweep back to 0° (close)
11. Detach the servo
12. Start the cooling fan cooldown timer (relay stays on for 30 more seconds)
13. **Only now** send `{"status":"DONE","stop":<N>}\n` back to the main board via UART

This entire sequence must be rock-solid reliable. Any failure at any step should result in an ERROR response with a descriptive message explaining what went wrong.

### Step 3.8 — Power and Safety Considerations

- The stepper driver should only be energized during movement to avoid overheating
- The servo should be detached after each use to prevent jitter and save power
- The relay should have a cooldown timeout before turning off
- All GPIO outputs should start in a safe state on boot (stepper disabled, servo at 0°, buzzer/LED/vibration off, relay off)
- Implement a watchdog timer (if appropriate) to recover from any unexpected hangs

---

## PHASE 4: Integration Testing

After both firmware files are complete:

1. Verify the UART communication protocol between the two boards by sending each command type and checking the response
2. Verify the MQTT message flow: schedule sync → main ESP32 processes schedule → sends MOVE command → secondary executes → main receives ACK → main publishes dose/dispensed → backend receives and updates database
3. Verify the BLE provisioning flow: Android app discovers device → sends WiFi credentials → ESP32 connects → MQTT connects → app navigates to dashboard
4. Verify the alarm notification flow end-to-end: backend detects upcoming dose → FCM push to app → simultaneously ESP32 OLED popup + alarm sound → user confirms → dose marked dispensed in backend
5. Verify the factory reset: long press RESET for 5 seconds → all settings cleared → device reboots into BLE pairing mode

---

## Key Frontend Interfaces for Backend Compatibility

The frontend `AppContext.tsx` defines these TypeScript interfaces that the backend API responses MUST match:

```typescript
interface Medication {
  id: string;
  name: string;
  color: string;
  enabled: boolean;
  schedule: { [day: string]: string }; // e.g., { "Monday": "08:00" }
}

interface DoseRecord {
  id: string;
  medicationId: string;
  medicationName: string;
  scheduledTime: Date;
  dispensedTime?: Date;
  status: 'upcoming' | 'dispensed' | 'missed' | 'overdue';
}

interface ConnectionStatus {
  connected: boolean;
  deviceName?: string;
  wifiConnected: boolean;
  mqttConnected: boolean;
  lastSync?: Date;
}
```

The frontend routes are:
- `/` → Splash screen
- `/ble-scan` → BLE device scanning
- `/wifi-provision` → WiFi credential input + provisioning progress
- `/dashboard` → Main hub with time, next dose widget, navigation grid
- `/schedule` → Set medication schedules by day with multi-day bulk scheduling
- `/upcoming` → View upcoming doses grouped by date
- `/dispenser` → Manual dispense, pause/resume, snooze (5/10/15 min)
- `/history` → Dose history with adherence rate, filter tabs (All/Taken/Missed/Overdue), CSV export
- `/settings` → App settings with medication management, notifications toggle, caregiver toggle, dark mode, BLE reconnect
- `/settings/medications` → CRUD for medications with color picker
- `/settings/caregiver` → Caregiver management with pairing code, SMS/permissions toggles
- `/system-info` → Device info, connectivity status, storage info, diagnostic logs

All API endpoints should be designed so the frontend can transition from its current placeholder data (hardcoded arrays, simulated BLE, fake provisioning) to real API calls with minimal refactoring. The data shapes must match.

---

## Summary of Deliverables

1. **Complete Backend** — Fully functional Node.js/Express server with PostgreSQL/Prisma, Redis, MQTT, FCM, Twilio, BullMQ, JWT auth, all REST endpoints, Swagger docs, and integration tests.
2. **Primary ESP32-S3 Firmware** — BLE provisioning, WiFi/MQTT connectivity, NTP/RTC time sync, OLED menu system (Upcoming, History, Settings with ringtone selector, System Info), medication scheduling with stop mapping, notification popup with confirm/cancel/snooze, UART command protocol, heartbeat publishing, long-press factory reset, fully non-blocking architecture.
3. **Secondary ESP32-S3 Firmware** — UART command listener, Bresenham stepper positioning (21 stops over 10,000 steps), servo open-dwell-close cycle, I2S audio playback from SD card through MAX98357A, buzzer/LED/vibration alarm outputs, relay-controlled cooling fan, persistent position storage, robust error handling.

Execute these in strict order: Backend first → Primary firmware second → Secondary firmware third. Do not begin a new phase until the previous phase is fully complete and verified.
