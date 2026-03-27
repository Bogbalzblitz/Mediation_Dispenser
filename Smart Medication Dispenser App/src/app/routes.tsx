import { createBrowserRouter } from "react-router";
import { Root } from "./screens/Root";
import { Splash } from "./screens/Splash";
import { BLEScanning } from "./screens/BLEScanning";
import { WiFiProvisioning } from "./screens/WiFiProvisioning";
import { Dashboard } from "./screens/Dashboard";
import { SetSchedule } from "./screens/SetSchedule";
import { UpcomingDoses } from "./screens/UpcomingDoses";
import { Dispenser } from "./screens/Dispenser";
import { History } from "./screens/History";
import { Settings } from "./screens/Settings";
import { SystemInfo } from "./screens/SystemInfo";
import { MedicationSettings } from "./screens/MedicationSettings";
import { CaregiverManagement } from "./screens/CaregiverManagement";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Splash },
      { path: "ble-scan", Component: BLEScanning },
      { path: "wifi-provision", Component: WiFiProvisioning },
      { path: "dashboard", Component: Dashboard },
      { path: "schedule", Component: SetSchedule },
      { path: "upcoming", Component: UpcomingDoses },
      { path: "dispenser", Component: Dispenser },
      { path: "history", Component: History },
      { path: "settings", Component: Settings },
      { path: "settings/medications", Component: MedicationSettings },
      { path: "settings/caregiver", Component: CaregiverManagement },
      { path: "system-info", Component: SystemInfo },
    ],
  },
]);
