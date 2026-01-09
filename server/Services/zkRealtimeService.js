import { createRequire } from "module";
const require = createRequire(import.meta.url);
const ZKLib = require("node-zklib");
import Settings from "../Model/settings.js";
import { processMachineEvent } from "../Controller/attendanceController.js";

let zkInstance = null;
let isConnected = false;
let reconnectionTimer = null;

export const initRealtimeService = async (io) => {
  try {
    const settings = await Settings.findOne({ effectiveTo: null });
    const ip = settings?.machineIp || "192.168.1.222";
    const port = settings?.machinePort || 4370;

    console.log(`[ZK Realtime] Initializing connection to ${ip}:${port}...`);

    zkInstance = new ZKLib(ip, port, 10000, 4000);

    // Create socket
    try {
      await zkInstance.createSocket();
      isConnected = true;
      // console.log(`[ZK Realtime] Socket created successfully.`);
    } catch (err) {
      console.error(`[ZK Realtime] Connection failed: ${err.message}`);
      scheduleReconnect(io);
      return;
    }

    // Register Event Listener
    // console.log(`[ZK Realtime] Registering event listeners...`);

    // Enable Realtime Events
    // Some devices need explicit enablement
    // console.log(`[ZK Realtime] Enabling device events...`);
    await zkInstance.enableDevice();

    // Monitor connection using getRealTimeLogs
    // This function typically takes a callback that is triggered on every new log
    zkInstance.getRealTimeLogs((data) => {
      // console.log("[ZK Realtime] RAW EVENT DATA:", data);

      // Data format check
      // data might be { userId, attTime, ... } or similar depending on library
      const userId = data.userId || data.deviceUserId;
      const dateStr = data.attTime || data.date || new Date();

      if (userId) {
        processMachineEvent(userId, new Date(dateStr), io);
      }
    });
  } catch (error) {
    console.error(`[ZK Realtime] Fatal Error:`, error);
    scheduleReconnect(io);
  }
};

const scheduleReconnect = (io) => {
  if (reconnectionTimer) return;
  console.log(`[ZK Realtime] Scheduling reconnect in 30 seconds...`);
  reconnectionTimer = setTimeout(() => {
    reconnectionTimer = null;
    initRealtimeService(io); // Retry
  }, 30000);
};
