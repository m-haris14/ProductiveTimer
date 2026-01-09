import Settings from "../Model/settings.js";
import Holiday from "../Model/holiday.js";
import { getTodayStart } from "../Utils/dateUtils.js";

export const getSettings = async (req, res) => {
  try {
    // Get currently active settings
    let settings = await Settings.findOne({ effectiveTo: null });
    if (!settings) {
      settings = new Settings(); // Default
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching settings" });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const { weeklyOffs, machineIp, machinePort } = req.body;
    const today = getTodayStart(); // Normalized today

    // Find currently active settings
    let currentSettings = await Settings.findOne({ effectiveTo: null });

    if (currentSettings) {
      // If the current settings became effective today, we can just update them
      // because they haven't affected any past history yet (assuming 00:00 start)
      if (currentSettings.effectiveFrom.getTime() === today.getTime()) {
        if (weeklyOffs) currentSettings.weeklyOffs = weeklyOffs;
        if (machineIp) currentSettings.machineIp = machineIp;
        if (machinePort) currentSettings.machinePort = machinePort;

        await currentSettings.save();
        return res.json(currentSettings);
      } else {
        // Close the old settings
        currentSettings.effectiveTo = today;
        await currentSettings.save();
      }
    }

    // Create new settings version (inheriting from old if not specified,
    // actually simpler to just take what's new or default)
    // Ideally we should copy old values if not provided in new request?
    // But UI usually sends full state. Let's assume UI sends full state for weeklyOffs.
    // For machineIp, if not sent, use old one?

    const newSettings = new Settings({
      weeklyOffs:
        weeklyOffs || (currentSettings ? currentSettings.weeklyOffs : [0]),
      machineIp:
        machineIp ||
        (currentSettings ? currentSettings.machineIp : "192.168.1.222"),
      machinePort:
        machinePort || (currentSettings ? currentSettings.machinePort : 4370),
      effectiveFrom: today,
    });
    await newSettings.save();
    res.json(newSettings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error updating settings" });
  }
};

// --- Holidays ---

export const getHolidays = async (req, res) => {
  try {
    // Return all holidays, maybe user wants to see history too?
    // Usually admin wants to see all.
    const holidays = await Holiday.find().sort({ date: 1 });
    res.json(holidays);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching holidays" });
  }
};

export const addHoliday = async (req, res) => {
  try {
    const { name, date } = req.body;
    // const today = getTodayStart();
    // Wait, holidays are for a specific date.
    // The requirement says "when we change any holiday its apply to previous recorded data as well i wont want that"
    // This usually implies changing a RECURRING rule or similar.
    // But if it's a specific date holiday (e.g., Dec 25, 2025), changing it affects attendance ON that date.
    // If that date is in the past, we shouldn't allow it or it shouldn't affect past records.
    // But attendance records are ALREADY generated for past dates.
    // If I edit a holiday for yesterday, it shouldn't change yesterday's calculated attendance status?
    // But attendance status is stored in Attendance record.
    // So if the Attendance record says "Working", adding a holiday now won't auto-change it to "Holiday".
    // However, reports might recalculate things based on holidays?
    // If reports lookup Holiday collection to determine "Working Days", then it would change history.
    // So, we need to make sure reports consider "Effective From".

    // Simplest: `effectiveFrom` is when this holiday RECORD was created.
    // When checking if a date X was a holiday, we check:
    // Holiday.findOne({ date: X, effectiveFrom: { $lte: X } })
    // Wait, if I add a holiday for NEXT week, effectiveFrom is today. Next week > today. So it counts.
    // If I add a holiday for LAST week, effectiveFrom is today. Last week < today. So it doesn't count.

    // Correct logic: A holiday on date D counts ONLY IF effectiveFrom <= D.
    // But if I add a holiday for tomorrow (D+1), effectiveFrom=today. Today <= D+1. Correct.
    // If I add a holiday for yesterday (D-1), effectiveFrom=today. Today > D-1. So it won't count for yesterday. Correct.

    const holiday = new Holiday({
      name,
      date,
      effectiveFrom: new Date(), // Set to now
    });
    await holiday.save();
    res.json(holiday);
  } catch (error) {
    res.status(500).json({ message: "Server error adding holiday" });
  }
};

export const deleteHoliday = async (req, res) => {
  try {
    await Holiday.findByIdAndDelete(req.params.id);
    res.json({ message: "Holiday deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error deleting holiday" });
  }
};

// Helper for other controllers if needed
export const getSettingsForDate = async (date) => {
  // Find settings that were active on 'date'
  // effectiveFrom <= date AND (effectiveTo > date OR effectiveTo is null)
  const settings = await Settings.findOne({
    effectiveFrom: { $lte: date },
    $or: [{ effectiveTo: { $gt: date } }, { effectiveTo: null }],
  }).sort({ effectiveFrom: -1 }); // Get latest matching (though should be non-overlapping)

  return settings || { weeklyOffs: [0] }; // Default
};
