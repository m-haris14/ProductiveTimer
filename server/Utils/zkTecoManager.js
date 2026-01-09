import { createRequire } from "module";
const require = createRequire(import.meta.url);
const ZKLib = require("node-zklib");

export const getAttendanceLogs = async (ip, port = 4370) => {
  try {
    console.log(`[ZKTeco] Attempting connection to ${ip}:${port}...`);
    const zk = new ZKLib(ip, port, 5000, 2000); // Reduced timeouts: 5s connection, 2s reply

    // Create socket to machine
    await zk.createSocket();
    console.log(`[ZKTeco] Connected successfully`);

    // Get all logs in the machine
    const response = await zk.getAttendances();
    console.log(`[ZKTeco] Response type:`, typeof response);

    // Extract the actual logs array from response.data
    const logs = response?.data || [];
    console.log(`[ZKTeco] Retrieved ${logs.length} attendance records`);

    // Also try to get users to verify device has data
    try {
      const users = await zk.getUsers();
      console.log(
        `[ZKTeco] Device has ${users?.data?.length || 0} users registered`
      );
      if (users?.data?.length > 0) {
        console.log(
          `[ZKTeco] Sample user IDs:`,
          users.data.slice(0, 5).map((u) => u.userId)
        );
      }
    } catch (err) {
      console.log(`[ZKTeco] Could not fetch users:`, err.message);
    }

    // Disconnect
    await zk.disconnect();
    console.log(`[ZKTeco] Disconnected`);

    return logs;
  } catch (error) {
    console.error("[ZKTeco] Connection Error:", error.message);
    if (
      error.message?.includes("ETIMEDOUT") ||
      error.message?.includes("timeout")
    ) {
      throw new Error(
        `Cannot reach ZKTeco device at ${ip}:${port}. Please check: 1) Device is powered on, 2) IP address is correct, 3) Device is on the same network`
      );
    }
    if (error.message?.includes("ECONNREFUSED")) {
      throw new Error(
        `Connection refused by ${ip}:${port}. The device may not be a ZKTeco or the port is incorrect.`
      );
    }
    throw new Error(`ZKTeco Error: ${error.message}`);
  }
};

export const getMachineUsers = async (ip, port = 4370) => {
  try {
    const zk = new ZKLib(ip, port, 5000, 2000);
    await zk.createSocket();
    const users = await zk.getUsers();
    await zk.disconnect();
    return users || [];
  } catch (error) {
    console.error("ZKTeco User Fetch Error:", error);
    throw error;
  }
};
