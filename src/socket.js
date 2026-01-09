import { io } from "socket.io-client";
import { API_BASE_URL } from "./config";

export const socket = io(API_BASE_URL, {
  withCredentials: true,
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});

socket.on("connect", () => {
  console.log("[Socket] Connected:", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("[Socket] Connection Error:", err.message);
});

socket.on("disconnect", (reason) => {
  console.warn("[Socket] Disconnected:", reason);
});
