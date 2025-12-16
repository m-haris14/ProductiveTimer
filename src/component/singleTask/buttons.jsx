const Buttons = ({ setShow, setActive, active }) => {
  return (
    <div className="inline-flex rounded-md shadow-sm"
  role="group"
  aria-label="Basic outlined example">
      <button
        type="button"
        onClick={() => {
          setActive("task");
          setShow("pomodoro");
        }}
        className={`${active === "task" ? "bg-[#D4636B] text-[#1E2145] border-0 px-10 py-2.5 rounded-full hover:bg-[#ce6970] hover:border-0 hover:px-5 hover:rounded-5 hover:text-[#1E2145] hover:py-2.5" : "bg-transparent text-[#4f5473] border-0 px-10 py-2.5 rounded-full hover:bg-[#1E2145]"}`}
      >
        Pomodoro
      </button>
      <button
        type="button"
        onClick={() => {
          setActive("start");
          setShow("break");
        }}
        className={`${active === "start" ? "bg-[#D4636B] text-[#1E2145] border-0 px-10 py-2.5 rounded-full hover:bg-[#ce6970] hover:border-0 hover:px-5 hover:rounded-5 hover:text-[#1E2145] hover:py-2.5"  : "bg-transparent text-[#4f5473] border-0 px-10 py-2.5 rounded-full hover:bg-[#1E2145]"}  `}
      >
        Break
      </button>
      <button
        type="button"
        onClick={() => {
          setActive("edit");
          setShow("edit");
        }}
        className={`${active === "edit" ? "bg-[#D4636B] text-[#1E2145] border-0 px-10 py-2.5 rounded-full hover:bg-[#ce6970] hover:border-0 hover:px-5 hover:rounded-5 hover:text-[#1E2145] hover:py-2.5" : "bg-transparent text-[#4f5473] border-0 px-10 py-2.5 rounded-full hover:bg-[#1E2145]"}`}
      >
        Edit
      </button>
    </div>
  );
};

export default Buttons;
