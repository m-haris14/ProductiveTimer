import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import useIdleTimer from "../../hooks/useIdleTimer";
import { socket } from "../../socket";

const DashTimer = ({ employeeId, onStatsUpdate, onStatusChange }) => {
  // State Initialization (Moved up to fix ReferenceError)
  const [seconds, setSeconds] = useState(0); // Main display (Work + Break)
  const [breakCountdown, setBreakCountdown] = useState(3600); // Break display (goes down)
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [isStopped, setIsStopped] = useState(false);
  const [isCheckedOut, setIsCheckedOut] = useState(false);
  const [isIdleStatus, setIsIdleStatus] = useState(false); // Server idle status
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [baseDailySeconds, setBaseDailySeconds] = useState(0); // Total display base
  const [baseBreakSeconds, setBaseBreakSeconds] = useState(0); // Break base
  const [baseBreakCountdown, setBaseBreakCountdown] = useState(3600); // Snapshot for stable countdown
  const [cumulativeBreakSeconds, setCumulativeBreakSeconds] = useState(0);
  const [idleCountdown, setIdleCountdown] = useState(0); // Idle time elapsed
  const [baseIdleSeconds, setBaseIdleSeconds] = useState(0); // Base idle time
  const [showIdleReasonModal, setShowIdleReasonModal] = useState(false);
  const [idleReason, setIdleReason] = useState("");



  // 30 minutes idle (1800s), Alert at 29m 50s
  const { isIdle, isPrompted } = useIdleTimer(1800000, 1790000);

  // Electron System Idle Tracking
  const [systemIdleSeconds, setSystemIdleSeconds] = useState(0);
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    if (window.electron) {
      setIsElectron(true);
      window.electron.onSystemIdleTime((inputSeconds) => {
        // inputSeconds is typically seconds, verify from main.cjs
        setSystemIdleSeconds(inputSeconds);
      });
    }
  }, []);

  // Auto-switch based on logic (Now safe to use state)
  useEffect(() => {
    // 1. Auto-Idle Logic
    if (isRunning && !isIdleStatus) {
      // If Electron: Use System Idle Time > 30 mins
      if (isElectron) {
        if (systemIdleSeconds >= 1800) {
          console.log("System Idle > 30 mins. Auto-switching to Idle.");
          startIdle();
        }
      }
      // If Web: Use Browser Idle Time (isIdle from useIdleTimer)
      else if (isIdle) {
        console.log("Browser Idle > 30 mins. Auto-switching to Idle.");
        startIdle();
      }
    }

    // 2. Auto-Stop: If on Break AND Break Countdown hits 0 -> Stop Timer
    if (isBreak && breakCountdown <= 0) {
      console.log("Break limit exhausted. Auto-stopping timer.");
      pauseTimer();
    }
  }, [isRunning, isIdle, isIdleStatus, isBreak, breakCountdown, isElectron, systemIdleSeconds]);

  // Format seconds → HH:MM:SS
  const formatTime = (secs) => {
    const s = Math.max(0, Math.floor(secs));
    const h = String(Math.floor(s / 3600)).padStart(2, "0");
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    const sec = String(s % 60).padStart(2, "0");
    return `${h}:${m}:${sec}`;
  };

  // Fetch Stats and Live Data
  const fetchStats = async () => {
    try {
      const todayRes = await axios.get(
        `${API_BASE_URL}/stats/today/${employeeId}`
      );

      const {
        cumulativeWorkSeconds,
        cumulativeBreakSeconds: fetchedBreakSeconds,
        totalDailySeconds,
        remainingBreakSeconds,
      } = todayRes.data;

      // ONLY update baseline and main display if NOT running (or stopped/break vs working transition handled elsewhere)
      // When running, we trust the local timer (startTime + elapsed) to be the smoothest.
      // We don't want the server polling to jitter the 'base' or the 'seconds'.
      setBaseDailySeconds(cumulativeWorkSeconds + fetchedBreakSeconds);
      setSeconds(totalDailySeconds);

      setBaseBreakSeconds(fetchedBreakSeconds);
      setCumulativeBreakSeconds(fetchedBreakSeconds);
      setBreakCountdown(remainingBreakSeconds);
      setBaseBreakCountdown(remainingBreakSeconds);

      if (onStatsUpdate) {
        onStatsUpdate(todayRes.data);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const loadActive = async () => {
    try {
      const statusRes = await axios.get(
        `${API_BASE_URL}/timer/status/${employeeId}`
      );
      const status = statusRes.data.status;

      if (status === "working") {
        const t = await axios.get(`${API_BASE_URL}/timer/active/${employeeId}`);
        setIsRunning(true);
        setIsBreak(false);
        setIsStopped(false);
        setIsCheckedOut(false);

        // Stabilize Start Time: Only update if drift is > 2 seconds or not set
        const calculatedStart = Date.now() - t.data.elapsedSeconds * 1000;
        if (!startTime || Math.abs(calculatedStart - startTime) > 2000) {
          setStartTime(calculatedStart);
        }
      } else if (status === "break") {
        const b = await axios.get(`${API_BASE_URL}/break/active/${employeeId}`);
        setIsBreak(true);
        setIsRunning(false);
        setIsStopped(false);
        setIsCheckedOut(false);

        // Stabilize Start Time for break too
        const calculatedStart = Date.now() - b.data.elapsedSeconds * 1000;
        if (!startTime || Math.abs(calculatedStart - startTime) > 2000) {
          setStartTime(calculatedStart);
        }
      } else if (status === "idle") {
        const idleData = await axios.get(`${API_BASE_URL}/idle/active/${employeeId}`);
        setIsIdleStatus(true);
        setIsRunning(false);
        setIsBreak(false);
        setIsStopped(false);
        setIsCheckedOut(false);

        // Stabilize Start Time for idle too
        const calculatedStart = Date.now() - idleData.data.elapsedSeconds * 1000;
        if (!startTime || Math.abs(calculatedStart - startTime) > 2000) {
          setStartTime(calculatedStart);
        }
        setBaseIdleSeconds(idleData.data.elapsedSeconds);
      } else if (status === "stopped") {
        setIsRunning(false);
        setIsBreak(false);
        setIsStopped(true);
        setIsCheckedOut(false);
        setStartTime(null);
      } else if (status === "checked-out") {
        setIsRunning(false);
        setIsBreak(false);
        setIsStopped(false);
        setIsCheckedOut(true);
        setStartTime(null);
      } else {
        setIsRunning(false);
        setIsBreak(false);
        setIsStopped(false);
        setIsCheckedOut(false);
        setStartTime(null);
      }
      if (onStatusChange) onStatusChange(status);
    } catch (err) {
      console.error(err);
    }
  };

  // ... inside component ...

  useEffect(() => {
    const init = async () => {
      await loadActive();
      await fetchStats();
    };
    init();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadActive();
        fetchStats();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // SOCKET.IO EVENT LISTENER
    // Replace Polling with Real-time "Push"
    const onAttendanceUpdate = (data) => {
      // Debug Log: ensure we see what we get
      // console.log(`[Socket Debug] Event: ${data.employeeId} MyID: ${employeeId}`);

      if (String(data.employeeId) === String(employeeId)) {
        // console.log("[Socket] Received update matching my ID:", data);

        // Optimistic / Instant State Update
        if (data.type === "start" || data.type === "resume") {
          setIsRunning(true);
          setIsBreak(false);
          setIsStopped(false);
          setIsCheckedOut(false);

          // Use server timestamp if available to sync accurately
          const effectiveStartTime = data.statusChangedAt
            ? new Date(data.statusChangedAt).getTime()
            : Date.now();
          setStartTime(effectiveStartTime);
        } else if (data.type === "stop") {
          setIsRunning(false);
          setIsBreak(false);
          setIsStopped(true);
          setIsCheckedOut(false);
          setStartTime(null);
        } else if (data.type === "break") {
          setIsRunning(false);
          setIsBreak(true);
          setIsStopped(false);
          setIsCheckedOut(false);

          const effectiveStartTime = data.statusChangedAt
            ? new Date(data.statusChangedAt).getTime()
            : Date.now();
          setStartTime(effectiveStartTime);
        }

        loadActive(); // Sync definitive state from DB
        fetchStats(); // Update stats (work duration etc)
      }
    };

    socket.on("attendance_update", onAttendanceUpdate);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      socket.off("attendance_update", onAttendanceUpdate);
    };
  }, [employeeId]);

  // Use refs for stable timing across re-renders
  const secondsRef = useRef(seconds);
  const startTimeRef = useRef(startTime);
  const isRunningRef = useRef(isRunning);
  const isBreakRef = useRef(isBreak);
  const baseDailySecondsRef = useRef(baseDailySeconds);
  const baseBreakSecondsRef = useRef(baseBreakSeconds);
  const baseBreakCountdownRef = useRef(baseBreakCountdown);
  const breakCountdownRef = useRef(breakCountdown);

  // Update refs when state changes
  useEffect(() => {
    secondsRef.current = seconds;
    startTimeRef.current = startTime;
    isRunningRef.current = isRunning;
    isBreakRef.current = isBreak;
    baseDailySecondsRef.current = baseDailySeconds;
    baseBreakCountdownRef.current = baseBreakCountdown;
    breakCountdownRef.current = breakCountdown;
    baseBreakSecondsRef.current = baseBreakSeconds;
  }, [
    seconds,
    startTime,
    isRunning,
    isBreak,
    baseDailySeconds,
    baseBreakCountdown,
    breakCountdown,
    baseBreakSeconds,
  ]);

  useEffect(() => {
    let animationFrameId;

    const tick = () => {
      if (
        startTimeRef.current &&
        (isRunningRef.current || isBreakRef.current)
      ) {
        const now = Date.now();
        const elapsed = Math.floor((now - startTimeRef.current) / 1000);

        // Calculate effective contribution to daily total
        // If on break, cap it at whatever break time was remaining.
        let effectiveElapsed = elapsed;
        if (isBreakRef.current) {
          effectiveElapsed = Math.min(elapsed, baseBreakCountdownRef.current);

          // Update break countdown display
          const newBreakRemaining = Math.max(
            0,
            baseBreakCountdownRef.current - elapsed
          );
          if (breakCountdownRef.current !== newBreakRemaining) {
            setBreakCountdown(newBreakRemaining);
          }
        }

        // Total display (Work + Break)
        const newSeconds = baseDailySecondsRef.current + effectiveElapsed;
        if (secondsRef.current !== newSeconds) {
          setSeconds(newSeconds);
        }
      }
      animationFrameId = requestAnimationFrame(tick);
    };

    if (isRunning || isBreak) {
      animationFrameId = requestAnimationFrame(tick);
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [isRunning, isBreak, baseDailySeconds, startTime]);

  // Remove the old Interval useEffect (it was conflicting)

  const startWork = async () => {
    try {
      await axios.post(`${API_BASE_URL}/timer/start`, { employeeId });
      setIsRunning(true);
      setIsBreak(false);
      setIsStopped(false);
      setIsCheckedOut(false);
      setStartTime(Date.now());
      fetchStats();
      if (onStatusChange) onStatusChange("working");
    } catch (err) {
      console.error(err);
    }
  };


  const startIdle = async () => {
    try {
      await axios.post(`${API_BASE_URL}/timer/idle/start`, { employeeId });
      setIsRunning(false);
      setIsBreak(false);
      setIsStopped(false);
      setIsIdleStatus(true);
      setIsCheckedOut(false);
      setStartTime(Date.now());
      fetchStats();
      if (onStatusChange) onStatusChange("idle");
    } catch (err) {
      console.error(err);
    }
  };

  const resumeFromIdleWithReason = async () => {
    if (!idleReason || idleReason.trim().length === 0) {
      alert("Please provide a reason for idle time");
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/timer/idle/resume`, {
        employeeId,
        reason: idleReason.trim()
      });
      setIsIdleStatus(false);
      setIsRunning(true);
      setIsBreak(false);
      setIsStopped(false);
      setIsCheckedOut(false);
      setStartTime(Date.now());
      setShowIdleReasonModal(false);
      setIdleReason("");
      fetchStats();
      if (onStatusChange) onStatusChange("working");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to resume from idle");
    }
  };
  const takeBreak = async () => {
    try {
      await axios.post(`${API_BASE_URL}/timer/stop`, { employeeId });
      setIsRunning(false);
      setIsBreak(true);
      setIsStopped(false);
      setIsCheckedOut(false);
      setStartTime(Date.now());
      fetchStats();
      if (onStatusChange) onStatusChange("break");
    } catch (err) {
      console.error(err);
    }
  };

  const pauseTimer = async () => {
    try {
      await axios.post(`${API_BASE_URL}/timer/pause`, { employeeId });
      setIsRunning(false);
      setIsBreak(false);
      setIsStopped(true);
      setIsCheckedOut(false);
      setStartTime(null);
      fetchStats();
      if (onStatusChange) onStatusChange("stopped");
    } catch (err) {
      console.error(err);
    }
  };

  const confirmCheckout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/timer/checkout`, { employeeId });
      setIsRunning(false);
      setIsBreak(false);
      setIsStopped(false);
      setIsCheckedOut(true);
      setShowCheckoutModal(false);
      setStartTime(null);
      fetchStats();
      if (onStatusChange) onStatusChange("checked-out");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-[#141843] rounded-2xl p-6 shadow-[0_0_40px_rgba(90,169,255,0.35)] flex flex-col justify-between relative overflow-hidden">
      <h2 className="text-lg mb-4 flex items-center gap-2">
        ⏱ Timer{" "}
        <span className="text-xs opacity-20 font-mono">({employeeId})</span>
      </h2>
      <div className="text-center py-4">
        <h1 className="text-6xl font-bold">{formatTime(seconds)}</h1>
        <p className="mt-2 opacity-70">
          {isCheckedOut ? (
            <span className="text-red-400 font-bold underline">
              Day Ended: Checked Out
            </span>
          ) : isIdleStatus ? (
            <span className="text-orange-400">
              Idle: {formatTime(Math.floor((Date.now() - (startTime || Date.now())) / 1000))}
            </span>
          ) : isBreak ? (
            <span className="text-purple-400">
              On Break: {formatTime(breakCountdown)}
            </span>
          ) : isRunning ? (
            <span className="text-green-400">Working on: Daily Output</span>
          ) : isStopped ? (
            <span className="text-yellow-400">Session Stopped/Paused</span>
          ) : (
            "Ready to Start"
          )}
        </p>
      </div>

      <div className="flex flex-wrap gap-4 mt-6">
        {isCheckedOut ? (
          <div className="w-full py-4 text-center bg-red-500/10 border border-red-500/30 rounded-xl">
            <p className="text-red-400 font-medium">
              You have checked out for today.
            </p>
            <p className="text-xs opacity-50">
              Attendance & total time recorded.
            </p>
          </div>
        ) : isIdleStatus ? (
          <button
            onClick={() => setShowIdleReasonModal(true)}
            className="flex-1 py-3 rounded-xl bg-linear-to-r from-orange-500 to-orange-600 cursor-pointer hover:scale-105 transition-transform font-bold"
          >
            ▶ Resume from Idle
          </button>
        ) : !isRunning && !isBreak ? (
          <button
            onClick={startWork}
            className="flex-1 py-3 rounded-xl bg-linear-to-r from-[#5aa9ff] to-[#3b82f6] cursor-pointer hover:scale-105 transition-transform font-bold"
          >
            ▶ {isStopped ? "Resume Work" : "Check In"}
          </button>
        ) : (
          <>
            {isRunning ? (
              <>
                <button
                  onClick={takeBreak}
                  disabled={cumulativeBreakSeconds >= 3600}
                  className={`flex-1 py-3 rounded-xl bg-linear-to-r from-[#8b5cf6] to-[#7c3aed] transition-transform font-bold ${cumulativeBreakSeconds >= 3600
                    ? "opacity-30 cursor-not-allowed filter grayscale"
                    : "cursor-pointer hover:scale-105"
                    }`}
                  title={
                    cumulativeBreakSeconds >= 3600 ? "Break limit reached" : ""
                  }
                >
                  ⏸ Take Break
                </button>
                <button
                  onClick={pauseTimer}
                  className="flex-1 py-3 rounded-xl bg-linear-to-r from-yellow-500 to-orange-600 cursor-pointer hover:scale-105 transition-transform font-bold"
                >
                  ⏹ Stop Timer
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={startWork}
                  className="flex-1 py-3 rounded-xl bg-linear-to-r from-[#5aa9ff] to-[#3b82f6] cursor-pointer hover:scale-105 transition-transform font-bold"
                >
                  ▶ Resume Work
                </button>
                <button
                  onClick={pauseTimer}
                  className="flex-1 py-3 rounded-xl bg-linear-to-r from-yellow-500 to-orange-600 cursor-pointer hover:scale-105 transition-transform font-bold"
                >
                  ⏹ Stop Timer
                </button>
              </>
            )}
            <button
              onClick={() => setShowCheckoutModal(true)}
              className="w-full py-3 rounded-xl bg-white/10 hover:bg-red-500/20 hover:text-red-400 border border-white/10 cursor-pointer transition-all font-bold"
            >
              🚪 Check Out
            </button>
          </>
        )}
      </div>

      {/* Checkout Confirmation Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1a1f4d] border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl transform transition-all scale-100 animate-in fade-in zoom-in duration-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/30">
                <span className="text-3xl">🚪</span>
              </div>
              <h2 className="text-2xl font-bold mb-2">Check Out?</h2>
              <p className="text-gray-400 mb-8">
                Are you sure you want to end your day? You won't be able to
                check in again until tomorrow.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowCheckoutModal(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmCheckout}
                  className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 transition-colors font-bold cursor-pointer"
                >
                  Yes, Check Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Idle Reason Modal */}
      {showIdleReasonModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1a1f4d] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl transform transition-all scale-100 animate-in fade-in zoom-in duration-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-500/30">
                <span className="text-3xl">⏸️</span>
              </div>
              <h2 className="text-2xl font-bold mb-2">Resume from Idle</h2>
              <p className="text-gray-400 mb-6">
                Please provide a reason for your idle time. This will be reviewed by the admin.
              </p>
              <textarea
                value={idleReason}
                onChange={(e) => setIdleReason(e.target.value)}
                placeholder="e.g., Meeting with client, Technical issue on PC, Working on design software..."
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 mb-6 min-h-[100px] resize-none focus:outline-none focus:border-orange-500/50"
                rows={4}
              />
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowIdleReasonModal(false);
                    setIdleReason("");
                  }}
                  className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={resumeFromIdleWithReason}
                  disabled={!idleReason || idleReason.trim().length === 0}
                  className="flex-1 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 transition-colors font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Resume Work
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Idle Warning Modal */}
      {(isRunning || isBreak) && isPrompted && !isIdle && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="text-center p-6 bg-[#1a1f4d] border border-yellow-500/50 rounded-2xl shadow-[0_0_50px_rgba(234,179,8,0.3)]">
            <div className="text-4xl mb-2">⚠️</div>
            <h3 className="text-xl font-bold text-yellow-400 mb-1">
              Are you still there?
            </h3>
            <p className="text-gray-300 text-sm mb-4">
              Moving to auto-mode in{" "}
              <span className="font-mono font-bold text-white">10 seconds</span>
              ...
            </p>
            <div className="text-xs uppercase tracking-widest text-blue-400 font-bold animate-pulse">
              Move mouse to dismiss
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashTimer;
