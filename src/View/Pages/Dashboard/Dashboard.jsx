import React, { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = ({ employeeId }) => {
  const [seconds, setSeconds] = useState(0); // Main display (Work + Break)
  const [breakCountdown, setBreakCountdown] = useState(60); // Break display (goes down)
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [baseDailySeconds, setBaseDailySeconds] = useState(0); // Sum of stopped sessions
  const [baseBreakSeconds, setBaseBreakSeconds] = useState(0); // Sum of stopped breaks
  const [stats, setStats] = useState({
    todayProgress: 0,
    weekProgress: 0,
    totalSecondsWeek: 0,
    totalSecondsToday: 0,
    cumulativeBreakSeconds: 0,
  });

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
      const [todayRes, weekRes] = await Promise.all([
        axios.get(`http://localhost:5000/stats/today/${employeeId}`),
        axios.get(`http://localhost:5000/stats/week/${employeeId}`),
      ]);

      const {
        totalWorkSeconds,
        cumulativeWorkSeconds,
        cumulativeBreakSeconds,
        totalDailySeconds,
        remainingBreakSeconds,
      } = todayRes.data;

      const { totalWorkSeconds: weekWorkSeconds } = weekRes.data;

      setBaseDailySeconds(cumulativeWorkSeconds + cumulativeBreakSeconds);
      setBaseBreakSeconds(cumulativeBreakSeconds);

      const todayProg =
        Math.min((totalWorkSeconds / (8 * 3600)) * 100, 100) || 0;
      const weekProg =
        Math.min((weekWorkSeconds / (40 * 3600)) * 100, 100) || 0;

      setStats({
        todayProgress: todayProg,
        weekProgress: weekProg,
        totalSecondsWeek: weekWorkSeconds,
        totalSecondsToday: totalWorkSeconds,
        cumulativeBreakSeconds: cumulativeBreakSeconds,
      });

      setSeconds(totalDailySeconds);
      setBreakCountdown(remainingBreakSeconds);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const loadActive = async () => {
    try {
      const t = await axios.get(
        `http://localhost:5000/timer/active/${employeeId}`
      );
      if (t.data) {
        setIsRunning(true);
        setIsBreak(false);
        setStartTime(Date.now() - t.data.elapsedSeconds * 1000);
        return;
      }
      const b = await axios.get(
        `http://localhost:5000/break/active/${employeeId}`
      );
      if (b.data) {
        setIsBreak(true);
        setIsRunning(false);
        setStartTime(Date.now() - b.data.elapsedSeconds * 1000);
      } else {
        setIsRunning(false);
        setIsBreak(false);
        setStartTime(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

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
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [employeeId]);

  useEffect(() => {
    let interval;
    if (startTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const sessionElapsed = Math.floor((now - startTime) / 1000);

        let effectiveSession = sessionElapsed;
        if (isBreak) {
          const remaining = 60 - baseBreakSeconds;
          effectiveSession = Math.min(sessionElapsed, remaining);
          setBreakCountdown(Math.max(0, remaining - sessionElapsed));
        }

        setSeconds(baseDailySeconds + effectiveSession);
      }, 1000);
    } else {
      setSeconds(baseDailySeconds);
      setBreakCountdown(Math.max(0, 60 - baseBreakSeconds));
    }
    return () => clearInterval(interval);
  }, [isRunning, isBreak, startTime, baseDailySeconds, baseBreakSeconds]);

  const startWork = async () => {
    try {
      await axios.post("http://localhost:5000/timer/start", { employeeId });
      setIsRunning(true);
      setIsBreak(false);
      setStartTime(Date.now());
      fetchStats();
    } catch (err) {
      console.error(err);
    }
  };

  const stopWork = async () => {
    try {
      await axios.post("http://localhost:5000/timer/stop", { employeeId });
      setIsRunning(false);
      setIsBreak(true);
      setStartTime(Date.now());
      fetchStats();
    } catch (err) {
      console.error(err);
    }
  };

  const checkout = async () => {
    try {
      await axios.post("http://localhost:5000/timer/checkout", { employeeId });
      setIsRunning(false);
      setIsBreak(false);
      setStartTime(null);
      fetchStats();
    } catch (err) {
      console.error(err);
    }
  };

  const dashArray = 314;
  const todayOffset = dashArray - (dashArray * stats.todayProgress) / 100;
  const weekOffset = dashArray - (dashArray * stats.weekProgress) / 100;

  return (
    <div className="h-screen flex text-white">
      <div className="flex-1">
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-[#141843] rounded-2xl p-6 shadow-[0_0_40px_rgba(90,169,255,0.35)] flex flex-col justify-between">
            <h2 className="text-lg mb-4 flex items-center gap-2">⏱ Timer</h2>
            <div className="text-center py-4">
              <h1 className="text-6xl font-bold">{formatTime(seconds)}</h1>
              <p className="mt-2 opacity-70">
                {isBreak ? (
                  <span className="text-purple-400">
                    On Break: {formatTime(breakCountdown)}
                  </span>
                ) : isRunning ? (
                  <span className="text-green-400">
                    Working on: Daily Output
                  </span>
                ) : (
                  "Ready to Start"
                )}
              </p>
            </div>
            <div className="flex gap-4 mt-6">
              {!isRunning && !isBreak ? (
                <button
                  onClick={startWork}
                  className="flex-1 py-3 rounded-xl bg-linear-to-r from-[#5aa9ff] to-[#3b82f6] cursor-pointer hover:scale-105 transition-transform font-bold"
                >
                  ▶ Check In
                </button>
              ) : (
                <>
                  {isRunning ? (
                    <button
                      onClick={stopWork}
                      disabled={stats.cumulativeBreakSeconds >= 60}
                      className={`flex-1 py-3 rounded-xl bg-linear-to-r from-[#8b5cf6] to-[#7c3aed] transition-transform font-bold ${
                        stats.cumulativeBreakSeconds >= 60
                          ? "opacity-30 cursor-not-allowed filter grayscale"
                          : "cursor-pointer hover:scale-105"
                      }`}
                      title={
                        stats.cumulativeBreakSeconds >= 60
                          ? "Break limit reached"
                          : ""
                      }
                    >
                      ⏸ Take Break
                    </button>
                  ) : (
                    <button
                      onClick={startWork}
                      className="flex-1 py-3 rounded-xl bg-linear-to-r from-[#5aa9ff] to-[#3b82f6] cursor-pointer hover:scale-105 transition-transform font-bold"
                    >
                      ▶ Stop Break
                    </button>
                  )}
                  <button
                    onClick={checkout}
                    className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-red-500/20 hover:text-red-400 border border-white/10 cursor-pointer transition-all font-bold"
                  >
                    ⏹ Check Out
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="bg-[#141843] rounded-2xl p-6 shadow-[0_0_40px_rgba(90,169,255,0.35)]">
            <h2 className="text-lg mb-6">Productivity Stats</h2>
            <div className="flex justify-around">
              <div className="text-center">
                <svg width="120" height="120">
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="#1e245c"
                    strokeWidth="10"
                    fill="none"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="#5aa9ff"
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray={dashArray}
                    strokeDashoffset={todayOffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize="22"
                  >
                    {Math.round(stats.todayProgress)}%
                  </text>
                </svg>
                <p className="mt-2 text-sm">Today</p>
              </div>
              <div className="text-center">
                <svg width="120" height="120">
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="#1e245c"
                    strokeWidth="10"
                    fill="none"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="#8b5cf6"
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray={dashArray}
                    strokeDashoffset={weekOffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize="22"
                  >
                    {Math.round(stats.weekProgress)}%
                  </text>
                </svg>
                <p className="mt-2 text-sm">This Week</p>
              </div>
            </div>
            <p className="mt-6 text-center opacity-70">
              {Math.floor(stats.totalSecondsWeek / 3600)} hrs{" "}
              {Math.floor((stats.totalSecondsWeek % 3600) / 60)} mins Worked
            </p>
          </div>
        </div>
        <div className="mt-6 bg-[#141843] rounded-2xl p-6 shadow-[0_0_40px_rgba(90,169,255,0.35)]">
          <h2 className="text-xl mb-4 ">Task Overview</h2>
          <table className="w-full text-sm">
            <thead className="opacity-60">
              <tr className="text-left">
                <th className="pb-3 px-2">Task</th>
                <th className="pb-3 px-2">Status</th>
                <th className="pb-3 px-2">Time</th>
                <th className="pb-3 px-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["UI Design", "In Progress", "2 hrs 15 mins"],
                ["Code Review", "Completed", "1 hr 10 mins"],
                ["Meeting", "In Progress", "45 mins"],
                ["Testing", "Pending", "30 mins"],
              ].map((t, i) => (
                <tr
                  key={i}
                  className="border-t border-white/10 hover:bg-white/5 transition-colors"
                >
                  <td className="py-4 px-2">{t[0]}</td>
                  <td className="px-2">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        t[1] === "Completed"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-blue-500/20 text-blue-400"
                      }`}
                    >
                      {t[1]}
                    </span>
                  </td>
                  <td className="px-2">{t[2]}</td>
                  <td className="py-4 px-2 text-right">
                    <button className="px-4 py-1 rounded-lg bg-linear-to-r from-[#5aa9ff] to-[#8b5cf6] cursor-pointer hover:opacity-80 transition-opacity">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
