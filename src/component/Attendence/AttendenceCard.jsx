const AttendenceCard = ({ title, value, color }) => (
  <div className="w-full bg-[#141857] rounded-2xl p-6 shadow-lg flex items-center gap-5">
    {/* Left Colored Box */}
    <div
      className={`w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold ${color}`}
    >
      {value}
    </div>

    {/* Right Content */}
    <div>
      <h3 className="text-sm text-gray-300">{title}</h3>
      <p className="text-xs text-gray-400 mt-1">This Month</p>
    </div>
  </div>
);

export default AttendenceCard;
